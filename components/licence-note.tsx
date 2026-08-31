import { licenceUrl, repositoryUrl, type Section } from "@/lib/sections";

/**
 * **Where the software a section describes lives, and on what terms**, at the
 * foot of that section's front page.
 *
 * It names the code, not this page: the pages are CC BY 4.0 and the whole split
 * is set out on `/{locale}/source`. Here a reader is being told about the thing
 * the section is about, which is the question somebody asks on arriving at
 * `/en/runner` - and the answer differs by section, so one statement in a site
 * footer would be the wrong shape.
 *
 * **The first sentence is skipped where a section has no repository of its
 * own.** `protocol` is that section: it describes a contract between two
 * programs rather than one program, so *the source is in X* would have to pick
 * one of them. Its licence link still resolves, because the contract is served
 * by a Server and that Server is software somebody runs under a licence.
 */
const text: Record<string, { source: [string, string]; licence: [string, string] }> = {
    en: {
        source: ["The source is in ", ". "],
        licence: ["This project is licensed under MIT. See ", "."],
    },
    pl: {
        source: ["Kod źródłowy jest w ", ". "],
        licence: ["Ten projekt jest na licencji MIT. Zobacz plik ", "."],
    },
};

const link = "font-medium underline underline-offset-4 hover:text-fd-foreground";

export function LicenceNote({ section, locale }: { section: Section; locale: string }) {
    const words = text[locale] ?? text.en;

    return (
        <p className="mt-12 border-t border-fd-border pt-4 text-sm text-fd-muted-foreground">
            {section.repository ? (
                <>
                    {words.source[0]}
                    <a href={repositoryUrl(section.repository)} rel="noreferrer noopener" target="_blank" className={link}>
                        {section.repository}
                    </a>
                    {words.source[1]}
                </>
            ) : null}
            {words.licence[0]}
            <a href={licenceUrl(section.licence)} rel="noreferrer noopener" target="_blank" className={link}>
                LICENSE
            </a>
            {words.licence[1]}
        </p>
    );
}
