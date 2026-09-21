// **What the sitemap offers a crawler must be what the site serves.**
//
// Reads `out/`, so `npm run build` comes first.
//
// Written 2026-09-21 from a Search Console export of `docs.algojudge.pl`, which
// reported 40 pages as *Alternative page with proper canonical tag* and 28 as
// *Page with redirect* against 239 indexed. Three causes, all of them invisible
// to every other check here because every other check reads `content/docs`
// rather than the built site:
//
//   1. 181 pages declared a canonical without the trailing slash. Next leaves a
//      path alone once a segment contains a dot, and every version segment does
//      — so a versioned page named an address that redirects to itself.
//   2. The newest version's pages and their version-less twins were both listed
//      and both declared themselves canonical, so the same text was offered
//      twice and the crawler chose.
//   3. Section roots were listed although `deploy/redirects.conf` redirects them.
//
// Each of those is a sitemap that argues with the pages it points at, and none
// of them fails a build.
import { readFile, stat } from "node:fs/promises";

import { SITE_URL } from "../lib/site.ts";

const OUT = "out";

const exists = (path) => stat(path).then(() => true, () => false);

if (!(await exists(`${OUT}/sitemap.xml`))) {
    console.error(`  FAIL ${OUT}/sitemap.xml is not here. Run \`npm run build\` first.`);
    process.exit(1);
}

const xml = await readFile(`${OUT}/sitemap.xml`, "utf8");
const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// The addresses the web server answers with a redirect rather than a page.
const conf = await readFile("deploy/redirects.conf", "utf8").catch(() => "");
const redirected = new Set(
    [...conf.matchAll(/^location = (\S+) \{ return 30[12]/gm)].map((m) => m[1]),
);

let failed = 0;
const fail = (message, detail) => {
    console.error(`  FAIL ${message}`);
    if (detail) console.error(`         ${detail}`);
    failed += 1;
};

if (locations.length === 0) fail("the sitemap lists nothing at all");

const seen = new Set();

for (const url of locations) {
    if (!url.startsWith(`${SITE_URL}/`)) {
        fail(`${url} is not on ${SITE_URL}`);
        continue;
    }

    // **The trailing slash is the canonical form**, set by `trailingSlash: true`.
    if (!url.endsWith("/")) {
        fail(`${url} has no trailing slash`, "`trailingSlash: true` makes that the canonical form");
        continue;
    }

    if (seen.has(url)) fail(`${url} is listed twice`);
    seen.add(url);

    const path = url.slice(SITE_URL.length);

    if (redirected.has(path)) {
        fail(`${url} is redirected by deploy/redirects.conf`, "a listed address must be a page");
        continue;
    }

    const file = `${OUT}${path}index.html`;
    if (!(await exists(file))) {
        fail(`${url} is listed and ${file} was not built`);
        continue;
    }

    const html = await readFile(file, "utf8");

    // **A listed page must not be one the crawler is then told to drop.**
    if (/<meta name="robots" content="noindex/.test(html)) {
        fail(`${url} is listed and carries noindex`);
    }

    // **And it must claim itself.** A page whose canonical names some other
    // address is a page the sitemap should have offered under that address.
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
    if (!canonical) {
        fail(`${url} declares no canonical`);
    } else if (canonical !== url) {
        fail(`${url} declares a different canonical`, canonical);
    }
}

if (failed > 0) {
    console.error(`\n  ${failed} problem(s) over ${locations.length} sitemap entries`);
    process.exit(1);
}

console.log(`  ok   the sitemap: ${locations.length} entries, each a page that claims itself`);
