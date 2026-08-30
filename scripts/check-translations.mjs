// **Every Polish page names the English page it was written from, and carries a
// fingerprint of it.** When the English moves and the Polish does not, this is
// what says so.
//
// Under `0.x` releases nothing is backward compatible, so an outdated Polish
// installation or backup procedure is more dangerous than none: the reader
// follows it, it does not work, and there is nothing on the page to suggest the
// English says something else now.
//
// Run with `--update` after deliberately re-reading a Polish page against its
// English source. That is the only thing that should ever move a fingerprint.
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { sections } from "../lib/sections.ts";

const ROOT = "content/docs";
const UPDATE = process.argv.includes("--update");

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

/** The front matter, and where it ends. Enough for `key: value`; no YAML here. */
function frontMatter(text) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (!match) return null;

    const fields = {};
    for (const line of match[1].split(/\r?\n/)) {
        const field = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
        if (field) fields[field[1]] = field[2].trim();
    }
    return { fields, block: match[1], end: match[0].length };
}

async function pages(directory) {
    const found = [];
    for (const entry of await readdir(directory, { withFileTypes: true, recursive: true })) {
        if (entry.isFile() && entry.name.endsWith(".mdx")) {
            found.push(join(entry.parentPath, entry.name));
        }
    }
    return found;
}

const polishSections = sections.filter((section) => section.polish).map((s) => s.slug);

let failed = false;
let updated = 0;
let checked = 0;

// 1. Every Polish page names a source, and the fingerprint still matches.
for (const path of await pages(join(ROOT, "pl"))) {
    const text = await readFile(path, "utf8");
    const matter = frontMatter(text);
    const shown = relative(ROOT, path).replaceAll("\\", "/");

    if (!matter) {
        console.error(`  FAIL ${shown}: no front matter`);
        failed = true;
        continue;
    }

    const source = matter.fields.source;
    if (!source) {
        console.error(`  FAIL ${shown}: no \`source:\` naming the English page it was written from`);
        failed = true;
        continue;
    }

    const english = await readFile(join(ROOT, source), "utf8").catch(() => null);
    if (english === null) {
        console.error(`  FAIL ${shown}: \`source: ${source}\` does not exist`);
        failed = true;
        continue;
    }

    checked += 1;
    const want = sha256(english);
    const have = matter.fields.sourceSha256;

    if (have === want) continue;

    if (UPDATE) {
        const block = have
            ? matter.block.replace(/^sourceSha256:.*$/m, `sourceSha256: ${want}`)
            : matter.block.replace(/^(source:.*)$/m, `$1\nsourceSha256: ${want}`);
        await writeFile(path, `---\n${block}\n---${text.slice(matter.end)}`);
        updated += 1;
        continue;
    }

    if (!have) {
        console.error(`  FAIL ${shown}: no \`sourceSha256:\`. Run \`npm run check:translations -- --update\``);
    } else {
        console.error(`  FAIL ${shown}: ${source} has changed since this was written`);
        console.error(`         recorded ${have}`);
        console.error(`         now      ${want}`);
        console.error(`         Re-read the Polish against it, then \`-- --update\`.`);
    }
    failed = true;
}

// 2. A section Polish is supposed to cover has no gaps. A missing page there
//    does not 404 - it silently renders English, which is exactly the failure
//    the fallback notice exists to make visible and this exists to prevent.
for (const section of polishSections) {
    for (const path of await pages(join(ROOT, "en", section))) {
        const polish = join(ROOT, "pl", relative(join(ROOT, "en"), path));
        const exists = await readFile(polish).then(() => true, () => false);
        if (exists) continue;

        console.error(`  FAIL ${relative(ROOT, path).replaceAll("\\", "/")}: no Polish counterpart`);
        console.error(`         /${section}/ is a section Polish covers, so this one falls back silently`);
        failed = true;
    }
}

if (failed) process.exit(1);

if (UPDATE) console.log(`  ok   ${updated} fingerprint(s) written, ${checked} page(s) checked`);
else console.log(`  ok   ${checked} Polish page(s) match the English they were written from`);
