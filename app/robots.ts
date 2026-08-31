import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Under `output: "export"` a metadata route has to say it is static; there is no
// request to derive anything from.
export const dynamic = "force-static";


/**
 * Written to `out/robots.txt` at build time.
 *
 * **Nothing is disallowed here**, and the duplicates are held out of the index
 * by `noindex` on the pages themselves instead — a `Disallow` would stop a
 * crawler *reading* those pages, and a page a crawler may not read is a page
 * whose `noindex` it never sees.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{ userAgent: "*", allow: "/" }],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
