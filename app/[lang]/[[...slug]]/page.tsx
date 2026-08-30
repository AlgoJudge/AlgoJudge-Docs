import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FallbackNotice } from "@/components/fallback-notice";
import { getMDXComponents } from "@/components/mdx";
import { source } from "@/lib/source";

type Params = { lang: string; slug?: string[] };

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

    return (
        <DocsPage toc={page.data.toc} full={page.data.full}>
            <DocsTitle>{page.data.title}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>
            <DocsBody>
                {fellBack ? <FallbackNotice locale={lang} /> : null}
                <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
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

    return {
        title: page.data.title,
        description: page.data.description,
    };
}
