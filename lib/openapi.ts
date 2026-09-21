import { readFileSync } from "node:fs";

import { createOpenAPI } from "fumadocs-openapi/server";

/**
 * The Server's own `openapi.json`, fetched by `scripts/sync-sources.mjs` from
 * the commit pinned in `content-sources.json` — never from a local build of the
 * Server, which would document whatever happened to be on this machine.
 *
 * **Every pinned document, not only the current one.** A released section keeps
 * a frozen copy of the REST reference under its version directory, and those
 * pages name a document of their own — `.sources/openapi-v0.1.json` — so that
 * re-pinning for the next release does not change what an older snapshot says.
 * Listing only the current document here fails the build on the first snapshot
 * whose Server served a path this one does not.
 *
 * The list is derived from the manifest so that pinning a document is the whole
 * of adding one: `sync-sources.mjs` writes `.sources/<key>.json` for every key,
 * and `snapshot.mjs` adds the key when it cuts a version.
 *
 * **No `proxyUrl`, deliberately.** A proxy exists to let the playground reach an
 * API the browser cannot; the playground is switched off (see
 * `components/api-page.tsx`), and adding one would be the first step toward
 * putting `docs.algojudge.pl` in the Server's `Cors:AllowedOrigins`. Accepted
 * 2026-08-09: introducing a playground later is a CORS decision, not a framework
 * one.
 */
const manifest = JSON.parse(readFileSync("content-sources.json", "utf8")) as Record<string, unknown>;

/** `.sources/openapi.json`, `.sources/openapi-v0.1.json`, … — newest first. */
export const documents = Object.keys(manifest)
    .filter((name) => !name.startsWith("$"))
    .map((name) => `.sources/${name}.json`);

export const openapi = createOpenAPI({ input: documents });

/**
 * **The current document alone, for generating pages.**
 *
 * `generateFiles` writes one page per tag of every document it is given, and
 * two releases share almost every tag name — so generating from the full list
 * writes `runner.mdx` once per document, each over the last, and leaves a file
 * that is neither. The snapshots are already written; only the live reference is
 * generated, and it is generated from what the site documents now.
 */
export const openapiCurrent = createOpenAPI({ input: [".sources/openapi.json"] });
