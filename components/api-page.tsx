"use client";

import "fumadocs-openapi/css/preset.css";
import { createOpenAPIPage } from "fumadocs-openapi/ui";

import { mediaAdapters } from "@/lib/media-adapters";

/**
 * The component the generated REST pages render into.
 *
 * **`playground: { enabled: false }` is an accepted decision, not a preference.**
 * A playground would have the reader's browser call a live installation
 * directly, which under a static export means adding `docs.algojudge.pl` to the
 * Server's `Cors:AllowedOrigins`. That origin is not added. Introducing one
 * later is a CORS decision rather than a framework one — accepted 2026-08-09.
 *
 * `scripts/check-no-playground.mjs` asserts the built site carries no request
 * form, because a default that flips in a future release would put one back
 * without anybody deciding to.
 */
export const OpenAPIPage = createOpenAPIPage({
    playground: { enabled: false },
    mediaAdapters,
});
