// **Every internal link resolves, and every internal link carries its locale.**
//
// The second half is the one a general link checker will not do for you. The URL
// grammar is `/{locale}/{section}/{version?}/{page}`, so a link written
// `/install/backup` is not a shorter form of anything - it is an address nobody
// serves. It is also the mistake a writer makes most often, because it is what
// the file tree looks like.
//
// Reading the content tree rather than the built site, so a broken link is a
// failed check rather than a page that 404s after deployment.
//
// **One part of that tree is build output.** The REST reference under
// `content/docs/en/server/rest/` is generated from the Server's `openapi.json`
// and is gitignored, so on a fresh clone it is not there and three perfectly
// good links into it look broken. Rather than report those, this says the
// reference was not generated and leaves them alone - CI builds first, so CI
// checks them.
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { i18nConfig } from "../lib/i18n.ts";
import { linkedFromCode } from "../lib/site.ts";

const ROOT = "content/docs";

async function pages(directory) {
    const found = [];
    for (const entry of await readdir(directory, { withFileTypes: true, recursive: true })) {
        if (entry.isFile() && entry.name.endsWith(".mdx")) found.push(join(entry.parentPath, entry.name));
    }
    return found;
}

/** `content/docs/en/install/index.mdx` -> `/en/install`; `.../backup.mdx` -> `/en/install/backup`. */
const toUrl = (path) =>
    "/" +
    relative(ROOT, path)
        .replaceAll("\\", "/")
        .replace(/\.mdx$/, "")
        .replace(/\/index$/, "");

const GENERATED = join(ROOT, i18nConfig.defaultLanguage, "server", "rest");
const generated = await readdir(GENERATED).then(() => true, () => false);

const known = new Set();

for (const locale of i18nConfig.languages) {
    for (const path of await pages(join(ROOT, locale))) known.add(toUrl(path));
}

// `fallbackLanguage` means an address in a language that never wrote the page
// still resolves - to the English one. Those addresses are legitimate targets,
// so a link to one is not broken.
for (const path of await pages(join(ROOT, i18nConfig.defaultLanguage))) {
    const tail = toUrl(path).slice(`/${i18nConfig.defaultLanguage}`.length);
    for (const locale of i18nConfig.languages) known.add(`/${locale}${tail}`);
}

/** `[text](/en/install)` and `<a href="/en/install">`, ignoring images. */
const LINK = /(?<!\!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|href=["']([^"']+)["']/g;

let failed = false;
let checked = 0;
let skipped = 0;

for (const locale of i18nConfig.languages) {
    for (const path of await pages(join(ROOT, locale))) {
        const shown = relative(ROOT, path).replaceAll("\\", "/");
        const text = await readFile(path, "utf8");

        for (const match of text.matchAll(LINK)) {
            const raw = match[1] ?? match[2];
            if (!raw || !raw.startsWith("/")) continue; // external, anchor, or relative

            checked += 1;
            const target = raw.split("#")[0].replace(/\/$/, "") || "/";

            const [, first] = target.split("/");
            if (!i18nConfig.languages.includes(first)) {
                console.error(`  FAIL ${shown}: ${raw}`);
                console.error(`         an internal link must start with a locale, e.g. /${locale}${target}`);
                failed = true;
                continue;
            }

            if (known.has(target)) continue;

            if (!generated && /^\/[a-z]{2}\/server\/rest(\/|$)/.test(target)) {
                skipped += 1;
                continue;
            }

            console.error(`  FAIL ${shown}: ${raw}`);
            console.error(`         nothing is served at ${target}`);
            failed = true;
        }
    }
}

// **The links the application makes for itself.** Everything above came out of
// a `.mdx` file; these come out of a component, so no page contains them and
// nothing else here would notice one breaking.
let fromCode = 0;
for (const locale of i18nConfig.languages) {
    for (const target of linkedFromCode(locale)) {
        fromCode += 1;
        if (known.has(target.replace(/\/$/, ""))) continue;
        console.error(`  FAIL lib/site.ts: nothing is served at ${target}`);
        console.error(`         a component links it, so no page mentions it and no other check reaches it`);
        failed = true;
    }
}

if (failed) process.exit(1);
console.log(`  ok   ${checked} internal link(s) resolve, and all carry a locale`);
console.log(`  ok   ${fromCode} address(es) linked from code resolve too`);
if (!generated) {
    console.log(`  --   ${skipped} link(s) into the REST reference were not checked: run \`npm run build\` to generate it`);
}
