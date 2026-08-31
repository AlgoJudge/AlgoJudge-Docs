import type { MetadataRoute } from "next";

import { i18nConfig } from "@/lib/i18n";
import { hreflang, SITE_URL } from "@/lib/site";
import { source } from "@/lib/source";
import { archiveState } from "@/lib/versions";

// Under `output: "export"` a metadata route has to say it is static; there is no
// request to derive anything from.
export const dynamic = "force-static";


/**
 * Written to `out/sitemap.xml` at build time.
 *
 * **Only pages that are actually written in their own language**, and only the
 * newest version of a section. A fallback page is the English text at a Polish
 * address and an archived page is superseded — both carry `noindex`, and
 * listing a `noindex` page in a sitemap is asking a crawler to fetch something
 * to be told to ignore it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [];

    for (const locale of i18nConfig.languages) {
        for (const page of source.getPages(locale)) {
            if (!page.path.startsWith(`${locale}/`)) continue;
            if (await archiveState(page.slugs)) continue;

            const languages = Object.fromEntries(
                i18nConfig.languages
                    .filter(
                        (other) =>
                            source.getPage(page.slugs, other)?.path.startsWith(`${other}/`) ?? false,
                    )
                    .map((other) => [hreflang[other], `${SITE_URL}/${other}/${page.slugs.join("/")}`]),
            );

            entries.push({
                // **With the trailing slash**, because `trailingSlash: true`
                // makes that the canonical form. A sitemap entry that redirects
                // to the address its own page declares canonical is a wasted
                // fetch and a contradiction.
                url: `${SITE_URL}${page.url}/`.replace(/\/+$/, "/"),
                changeFrequency: "weekly",
                priority: page.slugs.length === 0 ? 1 : 0.7,
                alternates: { languages },
            });
        }
    }

    return entries;
}
