// The Server's REST reference, generated from its own `openapi.json`.
//
// **Generated, never hand-written, and never committed** — accepted 2026-08-09.
// A hand-maintained API reference is wrong from the first endpoint somebody adds,
// and nobody can tell which half is stale.
//
// One page per tag rather than one per operation: the pinned document carries 44
// tags over 160 paths, and a page per operation would bury the eight a reader wants.
import { readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { generateFiles } from "fumadocs-openapi";

import { openapi } from "../lib/openapi.ts";

const OUT = "content/docs/en/server/rest";

// Regenerated from empty every time. A tag removed from the schema must not
// leave a page behind describing endpoints that no longer exist.
await rm(OUT, { recursive: true, force: true });

await generateFiles({
    input: openapi,
    output: OUT,
    per: "tag",
    groupBy: "tag",
});

// `generateFiles` writes one page per tag and no way in. The section links to
// `/en/server/rest`, so that address has to exist.
const tags = (await readdir(OUT))
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.slice(0, -".mdx".length))
    .sort();

const lines = [
    "---",
    "title: REST reference",
    "description: Every endpoint the Server serves, generated from its own openapi.json.",
    "---",
    "",
    "Generated from the Server's `openapi.json` at the commit pinned in",
    "`content-sources.json`, one page per tag. **Nothing here is written by hand**,",
    "so it cannot disagree with the Server it was generated from.",
    "",
    "There is no request playground. A static site cannot call an installation",
    "unless that installation names this one as a permitted origin, and none does.",
    "",
    ...tags.map((tag) => "- [" + tag + "](/en/server/rest/" + tag + ")"),
    "",
];

await writeFile(join(OUT, "index.mdx"), lines.join("\n"));

// Not written by `generateFiles` either, and without it the section's sidebar
// shows 44 raw tag names in whatever order the file system returned.
await writeFile(
    join(OUT, "meta.json"),
    JSON.stringify({ title: "REST reference", pages: ["index", ...tags] }, null, 2) + "\n",
);

console.log("  ok   the REST reference is in " + OUT + ": " + tags.length + " tag page(s) and an index");
