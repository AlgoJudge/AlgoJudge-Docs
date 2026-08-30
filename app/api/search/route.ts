import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

/**
 * **The index is a file, not a service.** Accepted 2026-08-09: search is built
 * at build time and answered in the reader's browser, because a static export
 * has no runtime to ask. `staticGET` is what writes the index out instead of
 * serving it; `components/search.tsx` is the client that reads it.
 */
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
