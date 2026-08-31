import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { i18nConfig, type Locale } from "@/lib/i18n";
import { documented, HOMEPAGE } from "@/lib/site";

const tagline: Record<Locale, string> = {
    en: "AlgoJudge documentation",
    pl: "Dokumentacja AlgoJudge",
};

const homepage: Record<Locale, string> = {
    en: "The project",
    pl: "Strona projektu",
};

export function baseOptions(locale: string): BaseLayoutProps {
    const language = (i18nConfig.languages as readonly string[]).includes(locale)
        ? (locale as Locale)
        : i18nConfig.defaultLanguage;

    return {
        i18n: i18nConfig,
        nav: {
            // **The version the reader is looking at, beside the name.** With no
            // release cut there is nothing to put in a version switcher, and an
            // empty switcher would suggest the choice exists. A word does not.
            title: (
                <span className="flex flex-col items-start leading-tight">
                    <span>{tagline[language]}</span>
                    <span className="text-[0.7rem] font-normal whitespace-nowrap text-fd-muted-foreground">
                        {documented.released ?? documented.label[language]}
                    </span>
                </span>
            ),
            url: `/${language}`,
        },
        // **No section links, deliberately.** Every section is a root folder, so
        // the sidebar already carries a switcher for them at the top; listing
        // the same five again put two navigations for one thing side by side.
        // What is not duplicated is the way back out of the documentation.
        links: [{ text: homepage[language], url: HOMEPAGE, external: true }],
        githubUrl: "https://github.com/AlgoJudge",
    };
}
