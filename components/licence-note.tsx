import { licenceUrl, type Section } from "@/lib/sections";

/**
 * **The licence of the software a section describes, on that section's front
 * page.**
 *
 * It names the code, not this page: the pages are CC BY 4.0 and the whole
 * split is set out on `/{locale}/source`. Here a reader is being told the terms
 * of the thing the section is about, which is the question somebody asks on
 * arriving at `/en/runner` - and the answer differs by section, so a single
 * statement in the footer would be the wrong shape.
 *
 * `target="_blank"` because it leaves the site, matching the repository link in
 * the sidebar.
 */
const text: Record<string, { before: string; after: string }> = {
    en: { before: "This project is licensed under MIT. See ", after: "." },
    pl: { before: "Ten projekt jest na licencji MIT. Zobacz plik ", after: "." },
};

export function LicenceNote({ section, locale }: { section: Section; locale: string }) {
    const words = text[locale] ?? text.en;

    return (
        <p className="mt-12 border-t border-fd-border pt-4 text-sm text-fd-muted-foreground">
            {words.before}
            <a
                href={licenceUrl(section.licence)}
                rel="noreferrer noopener"
                target="_blank"
                className="font-medium underline underline-offset-4 hover:text-fd-foreground"
            >
                LICENSE
            </a>
            {words.after}
        </p>
    );
}
