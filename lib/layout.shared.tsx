import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { i18nConfig, type Locale } from "@/lib/i18n";

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
        // **No `links`, deliberately.** Every section is a root folder, so the
        // sidebar already carries a switcher for them at the top. Adding the
        // same five as links put two navigations for the same thing one above
        // the other, in a different order.
        githubUrl: "https://github.com/AlgoJudge",
    };
}
