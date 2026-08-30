import "@/app/global.css";

import { i18nProvider, uiTranslations } from "fumadocs-ui/i18n";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { i18n, i18nConfig, type Locale } from "@/lib/i18n";
import { hreflang, ogLocale, OG_IMAGE, site, SITE_NAME, SITE_URL, TITLE_SUFFIX } from "@/lib/site";
import { polishInterface } from "@/lib/ui-translations";
import SearchDialog from "@/components/search";

const translations = i18n
    .translations()
    .extend(uiTranslations())
    .add({
        en: { displayName: "English" },
        pl: polishInterface,
    });

export default async function Layout({
    params,
    children,
}: {
    params: Promise<{ lang: string }>;
    children: ReactNode;
}) {
    const { lang } = await params;

    return (
        <html lang={lang} suppressHydrationWarning>
            <body className="flex min-h-screen flex-col">
                <RootProvider
                    i18n={i18nProvider(translations, lang)}
                    search={{ SearchDialog }}
                >
                    {children}
                </RootProvider>
            </body>
        </html>
    );
}

// Under `output: "export"` every dynamic segment must be enumerated at build
// time. Both languages exist from the first day, which is the whole point of
// `hideLocale: "never"`.
export function generateStaticParams() {
    return i18nConfig.languages.map((lang) => ({ lang }));
}

/**
 * Everything a page does not say for itself.
 *
 * **`metadataBase` is what makes the relative paths below absolute** — `og:url`
 * and `og:image` must be absolute or a card renders empty, and under a static
 * export there is no request to infer a host from.
 */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const locale = (i18nConfig.languages as readonly string[]).includes(lang)
        ? (lang as Locale)
        : i18nConfig.defaultLanguage;
    const { name, description } = site[locale];

    return {
        metadataBase: new URL(SITE_URL),
        title: {
            // Every page appends the site; the landing pages opt out with an
            // absolute title, or they would read "AlgoJudge documentation |
            // AlgoJudge Docs".
            template: `%s | ${TITLE_SUFFIX}`,
            default: name,
        },
        description,
        applicationName: SITE_NAME,
        generator: null,
        referrer: "strict-origin-when-cross-origin",
        formatDetection: { telephone: false, address: false, email: false },
        openGraph: {
            type: "website",
            siteName: name,
            title: name,
            description,
            url: `/${locale}`,
            locale: ogLocale[locale],
            alternateLocale: i18nConfig.languages
                .filter((other) => other !== locale)
                .map((other) => ogLocale[other]),
            images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
        },
        twitter: {
            card: "summary_large_image",
            title: name,
            description,
            images: [OG_IMAGE],
        },
        alternates: {
            canonical: `/${locale}`,
            languages: {
                ...Object.fromEntries(
                    i18nConfig.languages.map((other) => [hreflang[other], `/${other}`]),
                ),
                // What a crawler serves somebody whose language matches neither.
                "x-default": `/${i18nConfig.defaultLanguage}`,
            },
        },
    };
}
