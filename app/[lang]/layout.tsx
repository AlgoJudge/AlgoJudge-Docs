import "@/app/global.css";

import { i18nProvider, uiTranslations } from "fumadocs-ui/i18n";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";

import { i18n, i18nConfig } from "@/lib/i18n";
import SearchDialog from "@/components/search";

const translations = i18n
    .translations()
    .extend(uiTranslations())
    .add({
        en: { displayName: "English" },
        pl: { displayName: "Polski" },
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
