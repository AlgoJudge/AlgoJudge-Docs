// **The repository link in a section's sidebar, against the one source that
// says which repository that is.**
//
// Fumadocs builds a sidebar from `meta.json`, so the link has to be written
// there - once per section per language, six files today. `lib/sections.ts`
// already carries the mapping, and a mapping written twice is a mapping that
// drifts. This is the check that stops it: the entry must be present, must
// name the declared repository, and must be last, because a link that leaves
// the site does not belong in the middle of a page list.
//
// A section may also declare no repository. `protocol` does, on purpose - it is
// versioned by `AlgoJudge-Design`, which holds internal working documents, and
// this site exists in order not to send a reader there. So the absence is
// checked too: an `external:` entry in a section that declares none is a link
// somebody added without deciding what it means.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { i18nConfig } from "../lib/i18n.ts";
import { repositoryUrl, sections } from "../lib/sections.ts";

const ROOT = "content/docs";

/** `external:[Name](url)` - the grammar `fumadocs-core` parses in `pages`. */
const EXTERNAL = /^external:\[([^\]]+)]\((.+)\)$/;

let failed = false;
let checked = 0;

const fail = (where, message) => {
    console.error(`  FAIL ${where}: ${message}`);
    failed = true;
};

for (const section of sections) {
    for (const locale of i18nConfig.languages) {
        const path = join(ROOT, locale, section.slug, "meta.json");
        const text = await readFile(path, "utf8").catch(() => null);
        if (text === null) continue;

        const where = `${locale}/${section.slug}/meta.json`;
        const pages = JSON.parse(text).pages ?? [];
        const links = pages.filter((page) => typeof page === "string" && EXTERNAL.test(page));
        checked += 1;

        if (section.repository === null) {
            if (links.length > 0) {
                fail(where, `it carries ${links.length} external link(s), and this section declares none`);
                console.error(`         lib/sections.ts says ${section.slug} has no repository to link`);
            }
            continue;
        }

        const want = `external:[${section.repository}](${repositoryUrl(section.repository)})`;

        if (links.length !== 1) {
            fail(where, `expected exactly one external link, found ${links.length}`);
            console.error(`         it should be ${want}`);
            continue;
        }

        if (links[0] !== want) {
            fail(where, "the repository link does not match lib/sections.ts");
            console.error(`         meta.json     : ${links[0]}`);
            console.error(`         lib/sections.ts: ${want}`);
            continue;
        }

        if (pages.at(-1) !== want) {
            fail(where, "the repository link is not the last entry");
            console.error(`         a link that leaves the site belongs at the end of the page list`);
        }
    }
}

if (failed) process.exit(1);
console.log(`  ok   ${checked} section navigation(s) link the repository lib/sections.ts declares`);
