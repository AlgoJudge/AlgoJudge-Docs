import { i18nConfig } from "@/lib/i18n";

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
 * Everywhere that rule does not run. `next dev` is one — a static export has no
 * middleware, so the development server has no way to read a header — and so is
 * any host that serves `out/` without this repository's nginx configuration.
 * Without a page here, `/` is a 404 in both.
 *
 * It reads `navigator.languages`, which is the browser's own copy of the list it
 * puts in `Accept-Language`, and applies the same rule the server does: the
 * first tag decides, and anything that is not Polish is English. So the two
 * mechanisms cannot disagree about a reader.
 *
 * **`location.replace`, not `href`.** An assignment leaves `/` in the history,
 * so Back from `/en/` returns here and is redirected forwards again — the reader
 * cannot leave the site with the Back button.
 *
 * **The links are the answer for a browser with no JavaScript**, and the
 * `<noscript>` meta sends it to the default language rather than leaving it on a
 * page with nothing on it.
 */
export default function Page() {
    const other = i18nConfig.languages.filter((l) => l !== i18nConfig.defaultLanguage);

    return (
        <>
            <script
                // The server rule renders this unreachable; where it runs, it
                // runs during parsing, before anything is painted.
                dangerouslySetInnerHTML={{
                    __html: `(function(){var l=(navigator.languages&&navigator.languages[0])||navigator.language||"";location.replace(/^pl\\b/i.test(l)?"/pl/":"/en/")})()`,
                }}
            />
            <noscript>
                <meta httpEquiv="refresh" content={`0; url=/${i18nConfig.defaultLanguage}/`} />
            </noscript>
            <p style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
                <a href={`/${i18nConfig.defaultLanguage}/`}>AlgoJudge documentation</a>
                {other.map((lang) => (
                    <span key={lang}>
                        {" · "}
                        <a href={`/${lang}/`}>Dokumentacja AlgoJudge</a>
                    </span>
                ))}
            </p>
        </>
    );
}
