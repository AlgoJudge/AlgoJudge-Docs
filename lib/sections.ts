/**
 * **The five sections, and the one rule that governs them**: every section has
 * exactly one owning source and is versioned by that source's releases. A
 * section without an owner has no honest version axis, so it does not exist.
 * Accepted 2026-08-09.
 *
 * This list is the single place that says so, and what reads it is worth being
 * exact about: `components/fallback-notice.tsx` (which sections Polish covers,
 * and their Polish names), `lib/versions.ts` (whether a first path segment is a
 * section at all), `scripts/check-versions.mjs` and `scripts/snapshot.mjs`.
 *
 * **The navigation does not read it.** Each section's title and description are
 * also written in its `meta.json`, because that is where Fumadocs builds the
 * sidebar from — so renaming a section here changes the notice and the checks,
 * and the ten `meta.json` files are the other half of the edit. This comment
 * claimed otherwise until 2026-08-30, when the sidebar links it described were
 * removed for duplicating the section switcher.
 */
export interface Section {
    /** The first path segment after the locale. */
    readonly slug: string;
    /** The repository whose releases move this section's version. */
    readonly owner: string;
    /** Whether Polish is authored here, per the language policy of 2026-08-09. */
    readonly polish: boolean;
    /**
     * **The repository this section documents, linked from its own sidebar.**
     *
     * Usually the owner, and for four sections it is exactly the owner. It is a
     * separate field because one section's owner is not a repository a reader
     * should be sent to: `protocol` is versioned by `AlgoJudge-Design`, which
     * holds internal working documents with statuses, and this site exists in
     * order not to be that. So `protocol` links nowhere, and says so here
     * rather than by omission.
     */
    readonly repository: string | null;
    /**
     * **The repository whose `LICENSE` this section points at.** Always a
     * repository, never `null` - which is where it parts company with
     * `repository` above.
     *
     * A reader wants the terms of the software the section describes, and every
     * section describes some. `protocol` is the one where the two fields differ:
     * it links no repository in its sidebar, because the repository that
     * versions it holds internal documents - but the contract it describes is
     * served by a Server, and that is software somebody runs under a licence.
     */
    readonly licence: string;
    readonly title: Readonly<Record<"en" | "pl", string>>;
    readonly description: Readonly<Record<"en" | "pl", string>>;
}

export const sections: readonly Section[] = [
    {
        slug: "install",
        owner: "AlgoJudge-Ops",
        polish: true,
        repository: "AlgoJudge-Ops",
        licence: "AlgoJudge-Ops",
        title: { en: "Install and operate", pl: "Instalacja i utrzymanie" },
        description: {
            en: "Standing up an installation, keeping it running, and getting it back.",
            pl: "Postawienie instalacji, utrzymanie jej i odzyskanie po awarii.",
        },
    },
    {
        slug: "client",
        owner: "AlgoJudge-Client",
        polish: true,
        repository: "AlgoJudge-Client",
        licence: "AlgoJudge-Client",
        title: { en: "Using AlgoJudge", pl: "Korzystanie z AlgoJudge" },
        description: {
            en: "The application itself, for the people who compete in it and the people who run it.",
            pl: "Sama aplikacja — dla uczestników i dla prowadzących.",
        },
    },
    {
        slug: "server",
        owner: "AlgoJudge-Server",
        polish: false,
        repository: "AlgoJudge-Server",
        licence: "AlgoJudge-Server",
        title: { en: "Server", pl: "Server" },
        description: {
            en: "The domain model, the permission model, and the REST reference.",
            pl: "Model dziedziny, model uprawnień i referencja REST.",
        },
    },
    {
        slug: "runner",
        owner: "AlgoJudge-Runner",
        polish: false,
        repository: "AlgoJudge-Runner",
        licence: "AlgoJudge-Runner",
        title: { en: "Runner", pl: "Runner" },
        description: {
            en: "The machines that evaluate submissions, and how to run one.",
            pl: "Maszyny oceniające zgłoszenia i sposób ich uruchomienia.",
        },
    },
    {
        slug: "protocol",
        owner: "AlgoJudge-Design",
        polish: false,
        repository: null,
        licence: "AlgoJudge-Server",
        title: { en: "Protocol", pl: "Protokół" },
        description: {
            en: "The contract between a Server and a Runner.",
            pl: "Kontrakt między Serverem a Runnerem.",
        },
    },
] as const;

export const sectionSlugs = sections.map((section) => section.slug);

/** Where a repository lives. The organisation holds every one of them. */
export const ORGANISATION = "https://github.com/AlgoJudge";

export const repositoryUrl = (name: string) => `${ORGANISATION}/${name}`;

/**
 * What the sidebar calls the licence link. The file is `LICENSE` because that is
 * the conventional name; this is prose beside a page list, so it is a word.
 */
export const licenceLabel: Record<string, string> = { en: "Licence", pl: "Licencja" };

/** The licence file itself, on the default branch, so the link opens the text. */
export const licenceUrl = (name: string) => `${repositoryUrl(name)}/blob/main/LICENSE`;

const VERSION = /^v\d+\.\d+$/;

/**
 * The section this path is the front page of, or `null` when it is not one.
 *
 * `/en/install` today and `/en/install/v0.1` once a version is cut - the version
 * segment sits inside the section, so a snapshot has a front page of its own.
 * Anything deeper belongs to the section without being its front page.
 */
export function sectionIndex(slug: readonly string[] | undefined): Section | null {
    if (!slug?.length) return null;
    const rest = slug.length > 1 && VERSION.test(slug[1]) ? slug.slice(2) : slug.slice(1);
    if (rest.length > 0) return null;
    return sections.find((section) => section.slug === slug[0]) ?? null;
}

/** The sections Polish is authored for, by their Polish names. */
export const polishSections = sections.filter((section) => section.polish);
