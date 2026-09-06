import { createMDX } from "fumadocs-mdx/next";

/**
 * **A static export, deliberately.** The accepted decision of 2026-08-09: the
 * site is served by nginx as files, so the deployment carries no Node runtime.
 *
 * The consequence that catches people is that **middleware does not run**.
 * Locale redirection therefore cannot use `createI18nMiddleware`: `/` is
 * negotiated from `Accept-Language` by the web server — the `map` in
 * `deploy/nginx.conf` — and `hideLocale: "never"` in `lib/i18n.ts` keeps every
 * URL carrying its locale so nothing needs rewriting. `app/(root)/page.tsx` is
 * the same decision made in the browser, for the development server and for any
 * host that serves the export without those rules.
 *
 * **This file is `.mjs` rather than `.ts`** because `fumadocs-mdx` is ESM-only
 * and a TypeScript Next config needs Node's native TypeScript resolver.
 *
 * @type {import("next").NextConfig}
 */
const config = {
    output: "export",

    // One address per page. `/en/install` and `/en/install/` are otherwise two,
    // which is the trailing-slash question the URL contract left open; the
    // sibling site at algojudge.pl answered it the same way.
    trailingSlash: true,

    poweredByHeader: false,
    reactStrictMode: true,
};

export default createMDX()(config);
