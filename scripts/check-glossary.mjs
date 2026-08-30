// **The Polish pages must use the words the Polish interface uses.**
//
// A reader following a Polish page has to be able to find the button it names.
// If the page says "problem" and the screen says "Zadanie", the page is a
// mistranslation however good the sentence is.
//
// The glossary is not written here. It is read from the Client's own
// `pl/translation.json` at run time and **checked against what this file
// expects**, so a term the product renames cannot drift away from the
// documentation quietly: the rename fails this check on the next run and says
// which page has to be re-read.
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = "content/docs";
const GLOSSARY = "../AlgoJudge-Client/public/locales/pl/translation.json";

/**
 * `key` is looked up in the Client's Polish file and must still say `expect`.
 * `english` finds the term on the English page; `polish` is the stem the Polish
 * page must then contain. Stems rather than words, because Polish inflects.
 */
const TERMS = [
    { key: "Problem", expect: "Zadanie", english: /\bproblems?\b/i, polish: /zadani/i },
    { key: "Submission", expect: "Zgłoszenie", english: /\bsubmissions?\b/i, polish: /zgłoszen/i },
    { key: "Activity", expect: "Aktywność", english: /\bactivit(y|ies)\b/i, polish: /aktywno/i },
    { key: "Verdict", expect: "Werdykt", english: /\bverdicts?\b/i, polish: /werdykt/i },
    { key: "Group", expect: "Grupa", english: /\bgroups?\b/i, polish: /grup/i },
    { key: "Ranking", expect: "Ranking", english: /\branking\b/i, polish: /ranking/i },
];

/** Renderings that are wrong wherever they appear on a Polish page. */
const WRONG = [
    { pattern: /\bsubmisj/i, instead: "Zgłoszenie" },
    { pattern: /\bbiegacz/i, instead: "Runner, untranslated" },
    { pattern: /\btask(i|ów|iem)?\b/i, instead: "Zadanie - `Task` was renamed to `Problem` in 2026-08" },
];

const glossary = JSON.parse(await readFile(GLOSSARY, "utf8"));

let failed = false;

// The glossary itself still says what this file assumes it says.
for (const term of TERMS) {
    const actual = glossary[term.key];
    if (actual === term.expect) continue;

    console.error(`  FAIL the Client now translates "${term.key}" as "${actual}", not "${term.expect}"`);
    console.error(`         Re-read every Polish page that uses it, then update this script.`);
    failed = true;
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
        if (!term.english.test(body(english))) continue;
        if (term.polish.test(polish)) continue;

        console.error(`  FAIL ${shown}: the English page uses "${term.key}" and this one never says "${term.expect}"`);
        failed = true;
    }
}

if (failed) process.exit(1);
console.log(`  ok   ${checked} Polish page(s) use the interface's own words`);
