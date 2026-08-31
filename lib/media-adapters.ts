import type { CreateOpenAPIPageOptions } from "fumadocs-openapi/ui";

// `MediaAdapter` has no public entry point of its own, so it is taken from
// the option that consumes it rather than reached for through `dist/`.
type MediaAdapter = NonNullable<CreateOpenAPIPageOptions["mediaAdapters"]>[string];

/**
 * **The Server declares four JSON media types where it means one.**
 *
 * ASP.NET Core's default output formatters register `application/json`,
 * `text/json` and `application/*+json` on every endpoint, and the problem
 * details middleware adds `application/problem+json`. Fumadocs ships an adapter
 * for the first and refuses a document that mentions the others — *"Media type
 * text/json is not supported"*, which stops the build.
 *
 * They are not dropped from the document. The Server really does accept them,
 * and a reference that quietly omitted an accepted content type would be wrong
 * in the direction that costs somebody an afternoon.
 *
 * **No `generateExample`, deliberately.** Measured against the pinned document
 * on 2026-08-30: in all 373 content blocks, a JSON synonym never appears without
 * `application/json` beside it. So every one of these already has a worked
 * example under the canonical type, and a second identical one under a synonym
 * is noise.
 */
const asJson: MediaAdapter = {
    encode: (data) => JSON.stringify(data.body),
    generateExample: () => undefined,
};

export const mediaAdapters: Record<string, MediaAdapter> = {
    "text/json": asJson,
    "application/*+json": asJson,
    "application/problem+json": asJson,
};
