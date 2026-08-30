import { loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";

import { i18n } from "@/lib/i18n";

const docs = defineDocs({ dir: "content/docs" });

/**
 * Every page, in both languages.
 *
 * `baseUrl: "/"` rather than the customary `/docs`: the URL grammar accepted on
 * 2026-08-09 is `/{locale}/{section}/{version?}/{page}`, with the section
 * directly under the locale and no shared prefix above it. The section is the
 * first content directory, and each one carries `"root": true` in its
 * `meta.json`, which is what gives it a sidebar of its own rather than one tree
 * spanning all five.
 */
export const source = loader({
    i18n,
    baseUrl: "/",
    source: docs.toFumadocsSource(),
});
