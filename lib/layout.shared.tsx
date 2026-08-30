import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { i18nConfig, type Locale } from "@/lib/i18n";
import { sections } from "@/lib/sections";

const tagline: Record<Locale, string> = {
    en: "AlgoJudge documentation",
    pl: "Dokumentacja AlgoJudge",
};

export function baseOptions(locale: string): BaseLayoutProps {
    const language = (i18nConfig.languages as readonly string[]).includes(locale)
        ? (locale as Locale)
        : i18nConfig.defaultLanguage;

    return {
        i18n: i18nConfig,
        nav: {
            title: tagline[language],
            url: `/${language}`,
        },
        links: sections.map((section) => ({
            text: section.title[language],
            url: `/${language}/${section.slug}`,
            active: "nested-url",
        })),
        githubUrl: "https://github.com/AlgoJudge",
    };
}
