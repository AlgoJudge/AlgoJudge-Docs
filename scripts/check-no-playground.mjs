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
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = "out";

/**
 * Attributes the browser resolves on its own, before anybody clicks anything.
 *
 * **A plain `<a href>` is not one**, and is deliberately absent: a documentation
 * page linking to GitHub or to onlinejudge.org is doing its job. What is checked
 * is what the page fetches, not what it mentions.
 */
const FETCHED = /\b(?:src|action|formaction|data-src)\s*=\s*["']([^"']+)["']/gi;

/** What a rendered playground puts on the page. */
const PLAYGROUND = [/data-playground/i, /\bSend Request\b/];

// Hosts a documentation page may legitimately fetch from. There are none: the
// site is self-contained on purpose, so that it works from a laptop with no
// network and leaks no reader to a third party.
const ALLOWED_HOSTS = [];

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

for (const path of await Promise.resolve(pages)) {
    const html = await readFile(path, "utf8");
    const shown = path.replaceAll("\\", "/");

    const offenders = new Set();

    for (const [, url] of html.matchAll(FETCHED)) {
        const h = host(url);
        if (h && !ALLOWED_HOSTS.includes(h)) offenders.add(url);
        else if (!h) requests += 1;
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
console.log(`  ok   ${pages.length} page(s) fetch only from this site (${requests} same-site asset reference(s))`);
console.log(`  ok   ${rest} REST page(s) carry no request playground`);
