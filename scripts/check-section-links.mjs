// **The two links at the foot of a section's sidebar, against the one source
// that says what they are.**
//
// Fumadocs builds a sidebar from `meta.json`, so both links have to be written
// there - twelve entries across six files today. `lib/sections.ts` already
// carries the repository and the licence, and a fact written twice is a fact
// that drifts. This is the check that stops it: the pair must be present, must
// name what is declared, must be in that order, and must be the last two
// entries, because links that leave the site do not belong in the middle of a
// page list.
//
// A section may also declare no repository. `protocol` does, on purpose - it
// describes a contract between two programs rather than one program, so there
// is no single repository to send a reader to, and what versions it is not one
// either. So the absence is checked too, and it is the absence of
// **both**: a licence link with no repository beside it would be a licence
// belonging to nothing.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { i18nConfig } from "../lib/i18n.ts";
import { licenceLabel, licenceUrl, repositoryUrl, sections } from "../lib/sections.ts";

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

        const want = [
            `external:[${section.repository}](${repositoryUrl(section.repository)})`,
            `external:[${licenceLabel[locale] ?? licenceLabel.en}](${licenceUrl(section.licence)})`,
        ];

        if (links.length !== want.length) {
            fail(where, `expected ${want.length} external link(s), found ${links.length}`);
            for (const one of want) console.error(`         want: ${one}`);
            continue;
        }

        const wrong = want.findIndex((one, index) => links[index] !== one);
        if (wrong !== -1) {
            fail(where, "the repository and licence links do not match lib/sections.ts, or are the wrong way round");
            console.error(`         meta.json      : ${links[wrong]}`);
            console.error(`         lib/sections.ts: ${want[wrong]}`);
            continue;
        }

        if (JSON.stringify(pages.slice(-want.length)) !== JSON.stringify(want)) {
            fail(where, "the repository and licence links are not the last two entries");
            console.error(`         links that leave the site belong at the end of the page list`);
        }
    }
}

if (failed) process.exit(1);
console.log(`  ok   ${checked} section navigation(s) carry the links lib/sections.ts declares`);
