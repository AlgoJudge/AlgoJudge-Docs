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
 * **A component rather than an inline `<script>`.** On a fresh document either
 * would do, and that is the only way in today. An effect also survives a client
 * navigation, where a script injected through `dangerouslySetInnerHTML` would
 * not: React inserts it through `innerHTML`, and the browser never executes
 * those. Nothing inside the site links to `/`, so that path is not exercised —
 * it is here so that adding such a link later does not quietly land a reader on
 * a page of two links.
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
