// **The Polish pages must use the words the Polish interface uses.**
//
// A reader following a Polish page has to be able to find the button it names.
// If the page says "problem" and the screen says "Zadanie", the page is a
// mistranslation however good the sentence is.
//
// **The terms are committed here rather than read from `AlgoJudge-Client`.**
// They came from that repository — `public/locales/pl/translation.json` — but
// this is not a monorepo, and CI checks out one repository. A check that reaches
// through `../AlgoJudge-Client` passes on a workstation and dies with ENOENT on
// the runner, which is how this file was written the first time.
//
// So the copy is the source of truth for the check, and **the check verifies the
// copy** whenever the sibling repository happens to be there: if the product
// renames a term, this fails on the next local run and names the pages to
// re-read. In CI it says the comparison was skipped rather than pretending.
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { uiTranslations } from "fumadocs-ui/i18n";

import { GLOSSARY, GLOSSARY_SOURCE, TERMS, WRONG } from "../lib/glossary.ts";
import { polishInterface } from "../lib/ui-translations.ts";

const ROOT = "content/docs";

let failed = false;

// 1. The committed copy against the product, when the product is reachable.
const upstream = await readFile(GLOSSARY_SOURCE, "utf8").then(JSON.parse, () => null);

if (upstream === null) {
    console.log(`  --   ${GLOSSARY_SOURCE} is not here, so the copy was not re-checked`);
} else {
    for (const [key, expected] of Object.entries(GLOSSARY)) {
        const actual = upstream[key];
        if (actual === expected) continue;

        console.error(`  FAIL the Client now translates "${key}" as "${actual}", not "${expected}"`);
        console.error(`         Re-read every Polish page that uses it, then update lib/glossary.ts.`);
        failed = true;
    }
    if (!failed) console.log(`  ok   the committed glossary still matches the Client's own`);
}
if (failed) process.exit(1);

// 2. The Polish interface strings against the keys Fumadocs actually emits.
//
// **This is the one failure nothing else can see.** Fumadocs' translation keys
// are the English strings themselves, so a key it renames does not go missing -
// it silently renders in English. Lint stays green, typecheck stays green, the
// build stays green, and a Polish reader gets an English table of contents. Four
// such strings were sitting in the Client's Polish file before its own
// `check:i18n` existed, which is why this exists here too.
{
    const emitted = new Set(uiTranslations().keys);
    const ours = new Set(Object.keys(polishInterface));

    for (const key of emitted) {
        if (ours.has(key)) continue;
        console.error(`  FAIL lib/ui-translations.ts: no Polish for ${JSON.stringify(key)}`);
        failed = true;
    }
    for (const key of ours) {
        if (emitted.has(key)) continue;
        console.error(`  FAIL lib/ui-translations.ts: ${JSON.stringify(key)} is no longer a Fumadocs key`);
        console.error("         It renders in English now. Check what replaced it.");
        failed = true;
    }
    if (!failed) console.log(`  ok   all ${emitted.size} interface string(s) have Polish`);
}
if (failed) process.exit(1);

async function pages(directory) {
    const found = [];
    for (const entry of await readdir(directory, { withFileTypes: true, recursive: true })) {
        if (entry.isFile() && entry.name.endsWith(".mdx")) found.push(join(entry.parentPath, entry.name));
    }
    return found;
}

/** Front matter is metadata, not prose; `source:` names an English path. */
const body = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");

/**
 * Prose only: no code, and **no link targets**.
 *
 * A path is not a word. `/en/client/manager/problems` contains both *manager*
 * and *problems*, and matching a term inside one would ask the Polish page to
 * translate a URL - which it must not, because the locale is the only part of
 * an address that changes.
 */
const prose = (text) =>
    body(text)
        .replace(/^```[\s\S]*?^```/gm, "")
        .replace(/`[^`\n]*`/g, "")
        .replace(/\]\([^)]*\)/g, "]");

let checked = 0;

for (const path of await pages(join(ROOT, "pl"))) {
    const shown = relative(ROOT, path).replaceAll("\\", "/");
    const text = await readFile(path, "utf8");
    const polish = body(text);
    checked += 1;

    for (const { pattern, instead } of WRONG) {
        const hit = pattern.exec(polish);
        if (!hit) continue;
        console.error(`  FAIL ${shown}: "${hit[0]}" - use ${instead}`);
        failed = true;
    }

    const source = /^source:\s*(.+)$/m.exec(text)?.[1]?.trim();
    if (!source) continue;

    const english = await readFile(join(ROOT, source), "utf8").catch(() => null);
    if (english === null) continue;

    for (const term of TERMS) {
        if (!term.english.test(prose(english))) continue;
        if (term.polish.test(polish)) continue;

        console.error(`  FAIL ${shown}: the English page uses "${term.key}" and this one never says "${term.expect ?? GLOSSARY[term.key]}"`);
        failed = true;
    }
}

if (failed) process.exit(1);
console.log(`  ok   ${checked} Polish page(s) use the interface's own words`);
