// **A translation must have the same shape as the page it translates.**
//
// A copy-edit that drops a section, loses a warning or invents a heading passes
// every other check here: the fingerprint still matches, the glossary still
// matches, every link still resolves. What does not match is the outline.
//
// So this compares outlines - the sequence of headings **and callouts** in
// document order, fenced blocks by language, and internal links by target with
// the locale removed.
//
// Callouts are in that sequence because heading levels alone missed a real one:
// a Polish page carried the warning *"immediate and irreversible"* under
// **Export** while its English source had it under **Deleting the account**.
// Same headings, same count, same everything this used to compare - and a
// warning about destroying an account attached to downloading a file.
//
// **Not the text of a heading, and not the contents of a fence.** A sample value
// inside a command is localised on purpose - `--keep end-of-semester` reads
// `--keep koniec-semestru` - and refusing that would be refusing a translation
// for being translated.
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = "content/docs";

async function pages(directory) {
    const found = [];
    for (const entry of await readdir(directory, { withFileTypes: true, recursive: true })) {
        if (entry.isFile() && entry.name.endsWith(".mdx")) found.push(join(entry.parentPath, entry.name));
    }
    return found;
}

const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n---/;
const FENCE_OPEN = /^```([A-Za-z0-9]*)/m;
const FENCED_BLOCK = /^```[\s\S]*?^```/gm;
/** Headings and callouts, in document order: one sequence, not two lists. */
const OUTLINE = /^(#{1,6}) |<Callout\b[^>]*?\btype="([a-z]+)"/gm;
const INTERNAL_LINK = /\]\((\/[a-z]{2}\/[^)\s]*)\)/g;
const LOCALE_PREFIX = /^\/[a-z]{2}\//;

function outline(text) {
    const body = text.replace(FRONT_MATTER, "");
    // Whole blocks, so the list is one entry per block rather than one per
    // ``` line - the closing fence would otherwise appear as a nameless
    // language and make the failure message read oddly.
    const fences = [...body.matchAll(FENCED_BLOCK)].map(
        (block) => FENCE_OPEN.exec(block[0])?.[1] ?? "",
    );

    // Headings inside a fence are shell comments, not headings.
    const prose = body.replace(FENCED_BLOCK, "");
    const headings = [...prose.matchAll(OUTLINE)].map((m) =>
        m[1] ? `h${m[1].length}` : `callout:${m[2]}`,
    );

    const links = [...body.matchAll(INTERNAL_LINK)]
        .map((m) => m[1].replace(LOCALE_PREFIX, "/"))
        .sort();

    return { headings, fences, links };
}

let failed = false;
let compared = 0;

for (const path of await pages(join(ROOT, "pl"))) {
    const text = await readFile(path, "utf8");
    const source = /^source:\s*(.+)$/m.exec(text)?.[1]?.trim();
    if (!source) continue;

    const english = await readFile(join(ROOT, source), "utf8").catch(() => null);
    if (english === null) continue;

    const shown = relative(ROOT, path).replaceAll("\\", "/");
    const here = outline(text);
    const there = outline(english);
    compared += 1;

    for (const [what, mine, theirs] of [
        ["the outline of headings and callouts", here.headings, there.headings],
        ["the fenced blocks", here.fences, there.fences],
        ["the internal links", here.links, there.links],
    ]) {
        if (JSON.stringify(mine) === JSON.stringify(theirs)) continue;

        console.error(`  FAIL ${shown}: ${what} differs from ${source}`);
        console.error(`         English: ${JSON.stringify(theirs)}`);
        console.error(`         Polish : ${JSON.stringify(mine)}`);
        failed = true;
    }
}

if (failed) process.exit(1);
console.log(`  ok   ${compared} translated page(s) have the same shape as their source`);
