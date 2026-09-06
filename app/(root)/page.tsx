import Link from "next/link";

import { i18nConfig } from "@/lib/i18n";

import { GoToLocale } from "./go-to-locale";

/**
 * `/`, which belongs to no language.
 *
 * ## The redirect that matters is the web server's
 *
 * `deploy/nginx.conf` reads `Accept-Language` and answers `/` with a 302 to
 * `/pl/` or `/en/` before this file is ever served. That is where the decision
 * belongs: the reader's language preference is a request header, the answer is
 * an HTTP redirect, and nothing has to be downloaded or executed to get it.
 *
 * ## So what is this page for
 *
 * The places that rule cannot reach. `next dev` is one — a static export has no
 * middleware, so the development server has no way to read a header, and without
 * a page here `/` is a 404. A host serving `out/` on its own terms is the other.
 *
 * **Nothing inside the site links here**, deliberately: the mark at the top of
 * the sidebar goes to the front page of the language being read, because a link
 * that renegotiated the language would move a reader out of the one they chose.
 * So this page is reached by a typed address, a bookmark or a link from
 * somewhere else — always a fresh document.
 *
 * The links are the answer for a browser with no JavaScript, and the `<noscript>`
 * meta sends it to the default language rather than leaving it on a page with
 * nothing on it.
 */
export default function Page() {
    return (
        <>
            <GoToLocale />
            <noscript>
                <meta httpEquiv="refresh" content={`0; url=/${i18nConfig.defaultLanguage}/`} />
            </noscript>
            <p style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
                <Link href="/en/">AlgoJudge documentation</Link>
                {" · "}
                <Link href="/pl/">Dokumentacja AlgoJudge</Link>
            </p>
        </>
    );
}
