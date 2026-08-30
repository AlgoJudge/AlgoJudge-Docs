import { createI18nSearchAPI } from "fumadocs-core/search/server";

import { i18nConfig } from "@/lib/i18n";
import { source } from "@/lib/source";

/**
 * **The index is a file, not a service.** Accepted 2026-08-09: search is built
 * at build time and answered in the reader's browser, because a static export
 * has no runtime to ask. `staticGET` is what writes the index out instead of
 * serving it; `components/search.tsx` is the client that reads it.
 *
 * **The generated REST reference is left out, deliberately.** Its pages are
 * schema text rather than prose — 45 tag pages carrying every field name and
 * description in the API — and including them made the index **7.8 MB**, which
 * every reader downloads in full before the first keystroke resolves. That is a
 * blocking multi-second transfer on a phone, for a site whose whole premise is
 * that nothing here can be slow.
 *
 * Its **index page** stays in, so a search for *REST* still gets you there, and
 * the reference has a listing of its own once you arrive. Searching for an
 * endpoint by name is what that listing is for.
 *
 * Built by hand rather than through `createFromSource`, which takes a
 * `buildIndex` but offers no way to leave a page out.
 *
 * **One index per locale**, so a Polish reader does not download the English
 * one. Measured 2026-08-30: 6.2 MB for both together against 4.3 and 1.9 apart,
 * and nginx gzips it.
 */
const REFERENCE = "/server/rest/";

const EMPTY = { headings: [], contents: [] };

const indexFor = (locale: string) =>
    source
        .getPages(locale)
        .filter((page) => !page.url.includes(REFERENCE))
        .map((page) => {
            // A page whose file came from another language is a fallback: the
            // same English text, at a Polish address. **Indexing its body would
            // store every English sentence twice** — measured, that was 3 900 of
            // the index's 7 816 entries and half its weight.
            //
            // Title and description still go in, so a Polish reader searching
            // for *Runner* finds the page and is told on arrival that it is in
            // English. What they do not get is a full-text hit on a body that is
            // already indexed under its own address.
            const translated = page.path.startsWith(`${locale}/`);

            return {
                locale,
                id: page.url,
                url: page.url,
                title: page.data.title,
                description: page.data.description,
                structuredData: translated ? page.data.structuredData : EMPTY,
            };
        });

const apis = new Map<string, ReturnType<typeof createI18nSearchAPI>>(
    i18nConfig.languages.map((locale) => [
        locale,
        createI18nSearchAPI("advanced", { i18n: i18nConfig, indexes: indexFor(locale) }),
    ]),
);

export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
    return i18nConfig.languages.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const api = apis.get(lang);
    if (!api) return new Response("no such locale", { status: 404 });
    return api.staticGET();
}
