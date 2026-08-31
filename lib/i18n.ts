import { defineI18n, type I18nConfig } from "fumadocs-core/i18n";

/**
 * **English and Polish, and the locale is always in the URL.**
 *
 * `hideLocale: "never"` is what makes `/en/` present from the first day, so
 * adding a language later changes no existing address. It is also what lets
 * this site work as a static export at all: the other two settings redirect
 * with `NextResponse.rewrite`, and middleware does not run under
 * `output: "export"`.
 *
 * `parser: "dir"` puts the language in the first content directory —
 * `content/docs/pl/install/…` — rather than in each file's name
 * (`install.pl.mdx`, the `"dot"` default). With five sections, two languages
 * and a version directory to come, one language tree per directory is the
 * arrangement a person can still read. Measured against `fumadocs-core@16.15.4`
 * on 2026-08-30; the option had been recorded as unresolved.
 *
 * `fallbackLanguage: "en"` carries the accepted language policy of 2026-08-09:
 * Polish covers `/client/` and `/install/`, and a Polish address in any other
 * section renders the English page rather than a 404.
 * `components/fallback-notice.tsx` is what tells the reader that is what
 * happened.
 */
export const i18nConfig = {
    languages: ["en", "pl"],
    defaultLanguage: "en",
    hideLocale: "never",
    parser: "dir",
    fallbackLanguage: "en",
} as const satisfies I18nConfig;

/**
 * The API form, which is the config **plus a `translations` method**. That
 * method is why the two are separate: layout options cross into a client
 * component, and a function cannot. Server code takes this one; anything headed
 * for the browser takes `i18nConfig`.
 */
export const i18n = defineI18n(i18nConfig);

export type Locale = (typeof i18nConfig.languages)[number];
