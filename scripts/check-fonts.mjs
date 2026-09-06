// The pages are painted with the faces this site ships, and the mark with them.
//
//   URL=http://127.0.0.1:3000 npm run check:fonts
//
// **Not a check `npm run build` can do, and not one CI runs here.** It needs a
// browser and a served site, so it is local, in the way
// `AlgoJudge-Identity-Keycloak/scripts/e2e-browser.mjs` is: Playwright is
// resolved out of `AlgoJudge-Client`, which is where this workspace installs it,
// and `CLIENT_DIR` overrides the location. Playwright owns the lifetime of what
// it launches, so this is not a browser that has to be tracked.
//
// ## Why it asks the browser rather than the stylesheet
//
// `getComputedStyle(el).fontFamily` reports the **stack that was asked for**,
// never the face that drew the glyphs. A page whose `@font-face` points at the
// wrong subset therefore reads as perfect: the family resolves, the file loads,
// `document.fonts` says `loaded` — and every letter is painted by a system font
// because the file has none of them. That shipped once, and nothing here could
// see it. `document.fonts.check()` is worse still: it answers `true` for a
// family nothing defines.
//
// So this asks Chrome, over the DevTools protocol, which fonts actually rendered
// each node — `CSS.getPlatformFontsForNode` reports a glyph count per real font,
// and says whether each is a webfont or one of the machine's own.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const clientDir = process.env.CLIENT_DIR
    ?? path.resolve(process.cwd(), "..", "AlgoJudge-Client");
const require = createRequire(pathToFileURL(path.join(clientDir, "package.json")));
const { chromium } = require("playwright");

const BASE = process.env.URL ?? "http://127.0.0.1:3000";

let failed = 0;
const check = (ok, what) => {
    console.log(`  ${ok ? "ok  " : "FAIL"} ${what}`);
    if (!ok) failed += 1;
};

// One page in each language, because the Polish one is what reaches into
// `latin-ext`: without that file its diacritics fall back to another face in
// the middle of a word, and the English page cannot tell you.
const surfaces = [
    { lang: "en", expect: "Inter" },
    { lang: "pl", expect: "Inter" },
];

const browser = await chromium.launch();

for (const { lang } of surfaces) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/${lang}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    console.log(`\n[${lang}]`);

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: -1, pierce: true });

    const painted = async (selector) => {
        const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
        if (!nodeId) return null;
        const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
        return fonts;
    };

    const drawnBy = async (selector, family, what) => {
        const fonts = await painted(selector);
        if (!fonts) {
            check(false, `${what}: nothing matched ${selector}`);
            return;
        }
        const summary = fonts
            .map((f) => `${f.glyphCount}× ${f.familyName}${f.isCustomFont ? "" : " (this machine's)"}`)
            .join(", ");
        const strays = fonts.filter((f) => !f.isCustomFont || f.familyName !== family);
        check(strays.length === 0 && fonts.length > 0, `${what} is painted with ${family} — ${summary}`);
    };

    await drawnBy("#nd-sidebar [aria-label=\"AlgoJudge\"] text", "Inter", "the wordmark in the mark");
    await drawnBy("main p", "Inter", "body text");
    await drawnBy("h1", "Inter", "a heading");
    await drawnBy("code", "JetBrains Mono", "code");

    const mark = await page.evaluate(() => {
        const el = [...document.querySelectorAll('[aria-label="AlgoJudge"]')]
            .find((e) => e.getBoundingClientRect().width > 0);
        if (!el) return null;
        return {
            words: el.querySelector("text")?.textContent ?? null,
            href: el.closest("a")?.href ?? null,
            fill: getComputedStyle(el.querySelector("g")).fill,
            visible: document.querySelectorAll('[aria-label="AlgoJudge"]').length,
            svgRequests: performance.getEntriesByType("resource")
                .filter((e) => /\.svg(\?|$)/.test(e.name)).map((e) => e.name),
        };
    });

    check(mark !== null, "the mark is on the page");
    if (mark) {
        // A live `<text>` is the whole reason the drawing is inlined rather than
        // pointed at: an `<img>` renders in a document of its own that cannot
        // see this page's `@font-face`.
        check(mark.words === "AlgoJudge", `the mark is the live-text drawing — ${mark.words}`);
        check(mark.svgRequests.length === 0, "and the document requested no .svg at all");
        // Compared as a path, because the origin is whatever host is serving:
        // 127.0.0.1 in development, docs.algojudge.pl in production.
        check(mark.href !== null && new URL(mark.href).pathname === "/",
            `it links to the root of the site — ${mark.href}`);
    }

    await page.close();
}

await browser.close();
console.log(failed ? `\ncheck-fonts: ${failed} failed.` : "\ncheck-fonts: every page is painted with the faces this site ships.");
process.exit(failed ? 1 : 0);
