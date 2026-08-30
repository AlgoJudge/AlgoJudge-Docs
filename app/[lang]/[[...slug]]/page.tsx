import type { OpenAPIPageProps_Preloaded } from "fumadocs-openapi/ui";

import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArchiveBanner } from "@/components/archive-banner";
import { FallbackNotice } from "@/components/fallback-notice";
import { getMDXComponents } from "@/components/mdx";
import { OpenAPIPage } from "@/components/api-page";
import { i18nConfig } from "@/lib/i18n";
import { loadSchemas, narrow, type OperationRef } from "@/lib/openapi-preload";
import { archiveState } from "@/lib/versions";
import { source } from "@/lib/source";

type Params = { lang: string; slug?: string[] };

type OpenAPIPageProps = Omit<OpenAPIPageProps_Preloaded, "preloaded">;
type Schemas = NonNullable<Awaited<ReturnType<typeof loadSchemas>>>;

/**
 * The generated file renders `<OpenAPIPage document="…" operations={…} />` and
 * knows nothing about where the schema comes from. This binds the loaded one to
 * it without the generated file having to change.
 *
 * **It narrows before it binds.** `OpenAPIPage` is a client component, so
 * whatever crosses this boundary is serialised into the page — and the
 * operations the page renders are a prop of that element rather than something
 * the page's front matter knows, so this is the first place both halves are in
 * hand.
 */
const withSchemas = (schemas: Schemas) =>
    function BoundOpenAPIPage(props: OpenAPIPageProps) {
        const operations = (props.operations ?? []) as readonly OperationRef[];
        const docs = Object.fromEntries(
            Object.entries(schemas).map(([name, document]) => [name, narrow(document, operations)]),
        );

        return <OpenAPIPage {...props} preloaded={{ docs }} />;
    };

export default async function Page(props: { params: Promise<Params> }) {
    const { lang, slug } = await props.params;
    const page = source.getPage(slug, lang);
    if (!page) notFound();

    const MDX = page.data.body;

    // `fallbackLanguage: "en"` hands back the English page when the requested
    // one was never written. That is the accepted behaviour, not a defect — but
    // the reader is owed the fact.
    //
    // **`page.locale` is not the way to find out**, which is the trap here: it
    // reports the locale that was *asked for*, so it equals `lang` on a fallback
    // too. `page.path` is the file that actually supplied the text, and with
    // `parser: "dir"` its first segment is that file's language — `/pl/protocol`
    // comes back as `en/protocol/index.mdx`. Measured 2026-08-30.
    const fellBack = !page.path.startsWith(`${lang}/`);

    // Only the generated REST pages carry one; everything else gets nothing
    // and never renders the component.
    const schemas = await loadSchemas(page.data);
    const archived = await archiveState(slug);

    return (
        <DocsPage toc={page.data.toc} full={page.data.full}>
            <DocsTitle>{page.data.title}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>
            <DocsBody>
                {archived ? <ArchiveBanner state={archived} locale={lang} /> : null}
                {fellBack ? <FallbackNotice locale={lang} /> : null}
                <div lang={fellBack ? i18nConfig.defaultLanguage : undefined}>
                <MDX
                    components={getMDXComponents({
                        a: createRelativeLink(source, page),
                        ...(schemas ? { OpenAPIPage: withSchemas(schemas) } : {}),
                    })}
                />
                </div>
            </DocsBody>
        </DocsPage>
    );
}

export function generateStaticParams() {
    return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
    const { lang, slug } = await props.params;
    const page = source.getPage(slug, lang);
    if (!page) notFound();

    // **Two kinds of page must not be indexed.** A fallback is the English page
    // at a second address, and an archived version is a page superseded by a
    // newer one — indexing either means a search returns the same text twice and
    // the reader cannot tell which one applies to them.
    //
    // No `canonical` on either: for the fallback there is a real page at the
    // English address, and for an archive there is not — an older page is not
    // the newest page somewhere else.
    const duplicate = !page.path.startsWith(`${lang}/`) || (await archiveState(slug)) !== null;

    return {
        title: page.data.title,
        description: page.data.description,
        ...(duplicate ? { robots: { index: false, follow: true } } : {}),
    };
}
