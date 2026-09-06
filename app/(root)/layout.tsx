import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * A second root layout, for the one address that has no locale: `/`.
 *
 * **Two root layouts, and that is what a route group is for.** Every page of the
 * site proper lives under `app/[lang]/`, whose layout is the root layout for it
 * and writes `<html lang={lang}>`. `/` cannot be under that segment — it is the
 * address a reader arrives at before any language has been chosen — so it gets a
 * root of its own. Next allows this while there is no `app/layout.tsx`.
 *
 * Deliberately bare: no `global.css`, no provider, no fonts. This page exists to
 * be left immediately, and pulling the site's stylesheet in would download the
 * whole thing to render two links nobody reads.
 */
export const metadata: Metadata = {
    // A staging post, not a page. `/en/` and `/pl/` are what should be indexed,
    // and `app/sitemap.ts` lists them.
    robots: { index: false, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
