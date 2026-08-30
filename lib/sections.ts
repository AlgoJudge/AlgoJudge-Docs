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
    readonly title: Readonly<Record<"en" | "pl", string>>;
    readonly description: Readonly<Record<"en" | "pl", string>>;
}

export const sections: readonly Section[] = [
    {
        slug: "install",
        owner: "AlgoJudge-Ops",
        polish: true,
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
        title: { en: "Protocol", pl: "Protokół" },
        description: {
            en: "The contract between a Server and a Runner.",
            pl: "Kontrakt między Serverem a Runnerem.",
        },
    },
] as const;

export const sectionSlugs = sections.map((section) => section.slug);

/** The sections Polish is authored for, by their Polish names. */
export const polishSections = sections.filter((section) => section.polish);
