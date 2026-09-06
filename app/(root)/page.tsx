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
 * Two things the server rule cannot reach. `next dev` is one — a static export
 * has no middleware, so the development server has no way to read a header, and
 * without a page here `/` is a 404. The other is **the mark at the top of the
 * sidebar, which links to this address**: Next navigates there on the client, so
 * no document is requested and no server rule runs. `GoToLocale` handles both.
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
