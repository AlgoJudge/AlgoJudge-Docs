import { createOpenAPI } from "fumadocs-openapi/server";

/**
 * The Server's own `openapi.json`, fetched by `scripts/sync-sources.mjs` from
 * the commit pinned in `content-sources.json` — never from a local build of the
 * Server, which would document whatever happened to be on this machine.
 *
 * **No `proxyUrl`, deliberately.** A proxy exists to let the playground reach an
 * API the browser cannot; the playground is switched off (see
 * `components/api-page.tsx`), and adding one would be the first step towards
 * putting `docs.algojudge.pl` in the Server's `Cors:AllowedOrigins`. Accepted
 * 2026-08-09: introducing a playground later is a CORS decision, not a framework
 * one.
 */
export const openapi = createOpenAPI({
    input: [".sources/openapi.json"],
});
