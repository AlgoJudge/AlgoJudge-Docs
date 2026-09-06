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
                    <Mark className="mt-2 mb-3" />
                    <span>{tagline[language]}</span>
                    <span className="text-[0.7rem] font-normal whitespace-nowrap text-fd-muted-foreground">
                        {documented.released ?? documented.label[language]}
                    </span>
                </span>
            ),
            // **The whole header block is one link.** Fumadocs renders
            // `nav.title` inside a single anchor of its own, so the mark cannot
            // carry a second one without nesting `<a>` in `<a>`.
            //
            // **It goes to this language's front page, not to `/`.** `/`
            // negotiates from `Accept-Language`, so a reader with a Polish
            // browser reading the English pages would be moved to Polish by
            // clicking the mark — the site deciding it knew better than the
            // reader's own navigation. The language picker is what changes
            // language; the mark goes home. The way out to the project's own
            // site is the sidebar footer, `components/homepage-link.tsx`.
            url: `/${language}/`,
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
