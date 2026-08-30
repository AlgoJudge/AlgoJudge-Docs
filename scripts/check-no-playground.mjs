// **The built site must issue no request to anywhere but itself.**
//
// Accepted 2026-08-09: the OpenAPI playground is not implemented, because under
// a static export it would have the reader's browser call `api.algojudge.app`
// directly - which would mean adding `docs.algojudge.pl` to the Server's
// `Cors:AllowedOrigins`. That origin is not added, and introducing a playground
// later is a CORS decision rather than a framework one.
//
// `components/api-page.tsx` switches the playground off. This asserts the
// result, because a library default that flips in some future release would put
// one back without anybody deciding to.
//
// **It checks requests, not mentions.** The identity pages name
// `auth.algojudge.app` in prose, correctly - an operator has to be told what it
// is. A hostname in a sentence is not a request, and an earlier version of this
// check that could not tell the two apart failed on four pages that were right.
//
// **Script is not scanned, and neither are the chunks.** Next serialises the
// whole page - prose, link targets, nav configuration - into an RSC payload
// inside a `<script>`, so every URL a page merely mentions appears there. The
// bundled chunks look more promising and are not: tried on 2026-08-30, scanning
// `out/_next/static` for absolute URLs reported a core-js licence header, a
// base-ui error-page link, an F# grammar's issue tracker and a handful of URL
// parser fixtures - none of them a fetch, and nothing in a minified bundle
// distinguishes a string from a call site.
//
// What covers that gap is not a grep but the **`Content-Security-Policy`** in
// `deploy/nginx.conf`: `default-src 'self'` with `connect-src 'self'` means a
// bundled fetch to another origin is refused by the browser. The two are
// complementary - the policy catches what this cannot see, and this catches a
// page that would fetch cross-origin if the policy were ever removed.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { SITE_URL } from "../lib/site.ts";

const OUT = "out";

/**
 * Attributes the browser resolves on its own, before anybody clicks anything.
 *
 * **A plain `<a href>` is not one**, and is deliberately absent: a documentation
 * page linking to GitHub or to onlinejudge.org is doing its job.
 */
const FETCHED = /\b(?:src|srcset|poster|action|formaction|data-src)\s*=\s*["']([^"']+)["']/gi;

/**
 * **`<link href>` is one**, and leaving it out was the gap. A
 * `<link rel="stylesheet">` or `<link rel="preconnect">` pointing at a font
 * service is fetched on load and hands that service the reader's address -
 * exactly what this file says it prevents. Matched by element, so `<a href>`
 * stays exempt.
 */
const LINKED = /<link\b[^>]*?\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;

/** What a rendered playground puts on the page. */
const PLAYGROUND = [/data-playground/i, /\bSend Request\b/];

// Hosts a page may legitimately reference. **Only this site's own**, which is
// not an exception to the rule but the rule stated exactly: `canonical`,
// `hreflang` and `og:url` are absolute by specification, and they point here.
// Taken from `lib/site.ts` so the two cannot drift apart.
//
// Nothing else is allowed. The site is self-contained on purpose, so that it
// works from a laptop with no network and leaks no reader to a third party.
const ALLOWED_HOSTS = [new URL(SITE_URL).host];

async function files(directory, extension) {
    const found = [];
    for (const entry of await readdir(directory, { withFileTypes: true, recursive: true })) {
        if (entry.isFile() && entry.name.endsWith(extension)) found.push(join(entry.parentPath, entry.name));
    }
    return found;
}

const pages = await files(OUT, ".html").catch(() => {
    console.error(`  FAIL ${OUT}/ does not exist. Run \`npm run build\` first.`);
    process.exit(1);
});

const host = (url) => {
    try {
        return new URL(url).host;
    } catch {
        return null; // relative, a data: URI, or not a URL at all
    }
};

let failed = false;
let rest = 0;
let requests = 0;

for (const path of pages) {
    const html = await readFile(path, "utf8");
    const shown = path.replaceAll("\\", "/");
    const offenders = new Set();

    for (const pattern of [FETCHED, LINKED]) {
        for (const [, url] of html.matchAll(pattern)) {
            const at = host(url);
            if (at === null) requests += 1;
            else if (!ALLOWED_HOSTS.includes(at)) offenders.add(url);
        }
    }

    for (const url of offenders) {
        console.error(`  FAIL ${shown}: would fetch ${url}`);
        failed = true;
    }

    if (!shown.includes("/server/rest/")) continue;
    rest += 1;

    for (const pattern of PLAYGROUND) {
        if (!pattern.test(html)) continue;
        console.error(`  FAIL ${shown}: looks like it carries a request playground (${pattern})`);
        failed = true;
    }
}

if (failed) process.exit(1);
console.log(`  ok   ${pages.length} page(s) fetch only from this site (${requests} same-site reference(s))`);
console.log(`  ok   ${rest} REST page(s) carry no request playground`);
