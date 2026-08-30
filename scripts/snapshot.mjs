// **The release-day snapshot.** `npm run snapshot -- v0.1 [section …]`
//
// A section is versioned by its owning source's releases, at minor granularity.
// On the day `AlgoJudge-Ops` cuts `v0.1.0`, `/install/` gains a `v0.1/`
// directory holding exactly what the version-less path said that day, and the
// version-less path becomes a redirect to it.
//
// **No backfill.** A version directory is created on release day or not at all:
// there is no honest way to reconstruct later what a page said at a release, and
// a reconstruction is worse than an absence because it looks authoritative.
//
// **Nothing is ever deleted.** Under `0.x` releases old documentation is the
// only documentation that works for an installation that has not upgraded.
import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

import { i18nConfig } from "../lib/i18n.ts";
import { sections as allSections } from "../lib/sections.ts";

const ROOT = "content/docs";
const VERSION = /^v\d+\.\d+$/;

const [version, ...only] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const { defaultLanguage } = i18nConfig;

if (!version || !VERSION.test(version)) {
    console.error("usage: npm run snapshot -- v<major>.<minor> [section …]");
    console.error("       minor granularity: a patch release updates its directory in place.");
    process.exit(1);
}

const chosen = only.length > 0 ? allSections.filter((s) => only.includes(s.slug)) : allSections;
if (chosen.length === 0) {
    console.error(`no such section: ${only.join(", ")}`);
    process.exit(1);
}

const exists = (path) => stat(path).then(() => true, () => false);

/** Which version directories a section already has, newest last. */
async function versionsOf(locale, slug) {
    const base = join(ROOT, locale, slug);
    if (!(await exists(base))) return [];
    const entries = await readdir(base, { withFileTypes: true });
    return entries
        .filter((e) => e.isDirectory() && VERSION.test(e.name))
        .map((e) => e.name)
        .sort((a, b) => {
            const [am, an] = a.slice(1).split(".").map(Number);
            const [bm, bn] = b.slice(1).split(".").map(Number);
            return am - bm || an - bn;
        });
}

/** Every page of a section, excluding what is already a version snapshot. */
async function livePages(locale, slug) {
    const base = join(ROOT, locale, slug);
    if (!(await exists(base))) return [];

    const found = [];
    const walk = async (directory) => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                if (VERSION.test(entry.name)) continue;
                await walk(path);
            } else {
                found.push(path);
            }
        }
    };
    await walk(base);
    return found;
}

let copied = 0;

for (const section of chosen) {
    for (const locale of i18nConfig.languages) {
        const base = join(ROOT, locale, section.slug);
        const target = join(base, version);

        if (await exists(target)) {
            // A patch release updates its version directory in place, so this is
            // a refusal rather than a merge: overwriting silently would lose
            // whatever somebody corrected in the snapshot.
            console.error(`  FAIL ${locale}/${section.slug}/${version} already exists`);
            console.error(`         Delete it deliberately if you mean to re-cut it.`);
            process.exit(1);
        }

        for (const path of await livePages(locale, section.slug)) {
            const into = join(target, relative(base, path));
            await mkdir(dirname(into), { recursive: true });

            if (!path.endsWith(".mdx") && !path.endsWith(".json")) {
                await copyFile(path, into);
                copied += 1;
                continue;
            }

            let text = await readFile(path, "utf8");

            // **Links have to move with the pages.** A snapshot whose links point
            // back at the version-less path documents one version and sends the
            // reader to another - which is the exact failure archiving exists to
            // prevent.
            for (const other of i18nConfig.languages) {
                text = text.replaceAll(`/${other}/${section.slug}/`, `/${other}/${section.slug}/${version}/`);
                text = text.replaceAll(`(/${other}/${section.slug})`, `(/${other}/${section.slug}/${version})`);
            }

            // **`source:` has to move too, and it has no leading slash**, so the
            // link rewriting above does not touch it. Left alone, the archived
            // Polish page keeps pointing at the *live* English one: the first
            // edit to that page turns `check:translations` red on a frozen
            // archive, and the documented remedy (`-- --update`) then rewrites
            // the archive's fingerprint — destroying the provenance of something
            // this script calls immutable.
            text = text.replace(
                new RegExp(`^source:\\s*(${defaultLanguage})/${section.slug}/`, "m"),
                `source: $1/${section.slug}/${version}/`,
            );

            await writeFile(into, text);
            copied += 1;
        }
    }
}

// **The fingerprints have to be recomputed, not copied.** A Polish page records
// the SHA-256 of the English page it was written from; the copy above rewrote
// the English page's links to point inside the snapshot, so its bytes moved and
// the copied fingerprint no longer matches anything. Left as it was, every
// archived Polish page fails `check:translations` from the day it is cut - and
// the documented remedy would then repoint it at the *live* English page.
for (const section of chosen) {
    const base = join(ROOT, "pl", section.slug, version);
    if (!(await exists(base))) continue;

    for (const entry of await readdir(base, { withFileTypes: true, recursive: true })) {
        if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;

        const path = join(entry.parentPath, entry.name);
        const text = await readFile(path, "utf8");
        const source = /^source:\s*(.+)$/m.exec(text)?.[1]?.trim();
        if (!source) continue;

        const english = await readFile(join(ROOT, source), "utf8").catch(() => null);
        if (english === null) continue;

        const digest = createHash("sha256").update(english, "utf8").digest("hex");
        await writeFile(path, text.replace(/^sourceSha256:.*$/m, `sourceSha256: ${digest}`));
    }
}

// Every version except the newest is archived: `noindex`, and a banner naming
// the current one. **No `canonical`** - an older page is not the same page under
// another address, and pointing a reader at a newer procedure they cannot follow
// would be actively harmful. Accepted 2026-08-09.
const archive = {};
for (const section of allSections) {
    const versions = await versionsOf(i18nConfig.defaultLanguage, section.slug);
    if (versions.length === 0) continue;
    archive[section.slug] = { newest: versions.at(-1), all: versions };
}

await writeFile("versions.json", JSON.stringify(archive, null, 2) + "\n");

// The redirect map the web server consumes. `/` to the default locale always;
// a version-less section path to its newest version once one exists.
const rules = [
    "# Generated by `npm run snapshot`. Do not edit.",
    "#",
    "# The URL contract's redirects, as literal rules: a static export runs no",
    "# middleware, so every one of these is the web server's job.",
    "",
    `location = / { return 302 /${i18nConfig.defaultLanguage}/; }`,
];

for (const [slug, { newest }] of Object.entries(archive)) {
    for (const locale of i18nConfig.languages) {
        rules.push(`location = /${locale}/${slug}/ { return 302 /${locale}/${slug}/${newest}/; }`);
    }
}

await mkdir("deploy", { recursive: true });
await writeFile("deploy/redirects.conf", rules.join("\n") + "\n");

console.log(`  ok   ${version}: ${copied} file(s) snapshotted across ${chosen.length} section(s)`);
console.log(`  ok   versions.json and deploy/redirects.conf rewritten`);
