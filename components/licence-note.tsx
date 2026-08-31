import { licenceUrl, repositoryUrl, type Section } from "@/lib/sections";
import { linkedFromCode } from "@/lib/site";

/**
 * **Where the software a section describes lives, and on what terms**, at the
 * foot of that section's front page.
 *
 * Two of the three sentences are about the software the section describes,
 * which is the question somebody asks on arriving at `/en/runner` - and the
 * answer differs by section, so one statement in a site footer would be the
 * wrong shape. The third is about the page being read, and does not.
 *
 * **The CC BY sentence links `/{locale}/source`, not the Creative Commons
 * deed.** The deed states CC BY and can state nothing else; the split accepted
 * on 2026-08-31 carves the code samples back out to MIT, so the deed alone
 * would claim more of a page than we do. That carve-out is the part a reader
 * pasting a command needs, and only our own page carries it.
 *
 * **The first sentence is skipped where a section has no repository of its
 * own.** `protocol` is that section: it describes a contract between two
 * programs rather than one program, so *the source is in X* would have to pick
 * one of them. Its licence link still resolves, because the contract is served
 * by a Server and that Server is software somebody runs under a licence.
 */
interface Words {
    source: [string, string];
    licence: [string, string];
    pages: [string, string, string];
}

const text: Record<string, Words> = {
    en: {
        source: ["The source is in ", ". "],
        licence: ["This project is licensed under MIT. See ", ". "],
        pages: ["This documentation is ", "CC BY 4.0", "."],
    },
    pl: {
        source: ["Kod źródłowy jest w ", ". "],
        licence: ["Ten projekt jest na licencji MIT. Zobacz plik ", ". "],
        pages: ["Ta dokumentacja jest na licencji ", "CC BY 4.0", "."],
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
            {words.pages[0]}
            <a href={linkedFromCode(locale)[0]} className={link}>
                {words.pages[1]}
            </a>
            {words.pages[2]}
        </p>
    );
}
