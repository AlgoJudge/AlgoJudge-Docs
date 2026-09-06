import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { i18nConfig, type Locale } from "@/lib/i18n";
import { documented } from "@/lib/site";
import { Mark } from "@/components/mark";

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
            // **The mark, and then the two things it does not say.** The
            // drawing is the wordmark, so what is left to write under it is
            // what this site is and which version of the product it describes.
            //
            // **The version the reader is looking at, beside the name.** With no
            // release cut there is nothing to put in a version switcher, and an
            // empty switcher would suggest the choice exists. A word does not.
            title: (
                <span className="flex flex-col items-start leading-tight">
                    <Mark className="mb-1.5" />
                    <span>{tagline[language]}</span>
                    <span className="text-[0.7rem] font-normal whitespace-nowrap text-fd-muted-foreground">
                        {documented.released ?? documented.label[language]}
                    </span>
                </span>
            ),
            url: `/${language}`,
        },
        // **No links at all here, deliberately.** Every section is a root folder,
        // so the sidebar already carries a switcher for them at the top; listing
        // the same five again put two navigations for one thing side by side.
        // The one link that is not a duplicate — the way back out to the project
        // — sits in the sidebar footer instead, above the language picker:
        // `components/homepage-link.tsx`.
        githubUrl: "https://github.com/AlgoJudge",
    };
}
