// **No page directly under a section may be named so as to look like a version.**
//
// The URL grammar is `/{locale}/{section}/{version?}/{page}`, and the only thing
// separating a version segment from a page segment is the shape of the name. A
// page called `v2` under `/server/` would be unreachable the day `v2` is cut,
// and the failure would look like a routing bug rather than a naming one.
//
// Accepted 2026-08-09, and it is the one rule in the URL contract that cannot be
// enforced by anything but a check.
import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { sectionSlugs } from "../lib/sections.ts";

const ROOT = "content/docs";
const VERSION = /^v\d/;

let failed = false;

for (const locale of await readdir(ROOT)) {
    for (const section of await readdir(join(ROOT, locale))) {
        if (!sectionSlugs.includes(section)) continue;

        for (const entry of await readdir(join(ROOT, locale, section), { withFileTypes: true })) {
            const name = entry.name.replace(/\.mdx$/, "");

            // A directory named `v0.1` under a section *is* a version snapshot.
            // Only files are refused; `scripts/snapshot.mjs` makes the directories.
            if (entry.isDirectory()) continue;
            if (!VERSION.test(name)) continue;

            console.error(`  FAIL ${locale}/${section}/${entry.name}`);
            console.error("         a page directly under a section must not be named `v` followed by a digit");
            failed = true;
        }
    }
}

if (failed) {
    console.error("\nRename it. The version segment and the page segment are told apart by this and nothing else.");
    process.exit(1);
}

console.log(`  ok   no page under a section is named like a version`);
