"use client";

import { useEffect } from "react";

import { i18nConfig } from "@/lib/i18n";

/**
 * Sends `/` on to a language, in the browser.
 *
 * **The rule is the server's, and this is the same rule.** `deploy/nginx.conf`
 * reads `Accept-Language` and answers `/` with a 302 before anything here is
 * fetched; `navigator.languages` is the browser's own copy of that list, so the
 * two cannot disagree about a reader: the first tag decides, and anything that
 * is not Polish is English.
 *
 * **It has to be a component rather than an inline `<script>`**, because `/` is
 * reached two different ways. A visitor typing the address gets a document, and
 * the server rule catches them. But the mark at the top of the sidebar links
 * here, and Next navigates to it **on the client** — no document is requested,
 * so no server rule runs, and a script injected through
 * `dangerouslySetInnerHTML` is inert when React inserts it. An effect runs on
 * both paths.
 *
 * **`replace`, not `assign`.** An assignment leaves `/` in the history, so Back
 * from `/en/` returns here and is sent forward again — the reader cannot leave
 * the site with the Back button.
 */
export function GoToLocale() {
    useEffect(() => {
        const preferred = (navigator.languages?.[0] ?? navigator.language ?? "").toLowerCase();
        // `pl` and `pl-PL`, but not `ple` — the same boundary the server's
        // `~*^pl([-;,]|$)` draws. A rule that matched more here than there is a
        // rule the two halves disagree about.
        const language = i18nConfig.languages.find((l) => preferred === l || preferred.startsWith(`${l}-`))
            ?? i18nConfig.defaultLanguage;
        window.location.replace(`/${language}/`);
    }, []);

    return null;
}
