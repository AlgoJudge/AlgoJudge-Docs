/**
 * **The product's own Polish words, copied here on purpose.**
 *
 * They come from `AlgoJudge-Client/public/locales/pl/translation.json`, which is
 * where the interface gets them — but this is not a monorepo and CI checks out
 * one repository, so a check that reads across a sibling directory works on a
 * workstation and fails on a runner.
 *
 * `scripts/check-glossary.mjs` re-checks this copy against the Client whenever
 * the Client is on disk, so the copy cannot drift away from the product quietly:
 * a rename there turns this check red locally and names what to re-read.
 */
export const GLOSSARY_SOURCE = "../AlgoJudge-Client/public/locales/pl/translation.json";

/** The key is the English string the Client uses as its translation key. */
export const GLOSSARY: Record<string, string> = {
    Problem: "Zadanie",
    Submission: "Zgłoszenie",
    Activity: "Aktywność",
    Verdict: "Werdykt",
    Group: "Grupa",
    Ranking: "Ranking",

    // **The two words for the person who runs a contest.** `Manager` is the
    // navigation item and `Staff` is the role. Neither was here on 2026-08-30,
    // and the omission cost something: the interface settled on *prowadzący*
    // while the documentation went on saying *menedżer* in twenty-six places,
    // and nothing noticed until somebody read both.
    Manager: "Zarządzanie",
    Staff: "Prowadzący",
};

/**
 * `english` finds the term on the English page; `polish` is the stem the Polish
 * page must then contain. Stems rather than words, because Polish inflects.
 */
export const TERMS = [
    // `expect` names the word the failure message should print, where it
    // differs from the catalogue value: in prose the role reads *prowadzący*,
    // while the navigation item itself is *Zarządzanie*.
    { key: "Staff", english: /\bmanagers?\b/i, polish: /prowadząc|Zarządzanie/, expect: "prowadzący, or the panel's own name Zarządzanie" },
    { key: "Problem", english: /\bproblems?\b/i, polish: /zadani/i },
    { key: "Submission", english: /\bsubmissions?\b/i, polish: /zgłoszen/i },
    { key: "Activity", english: /\bactivit(y|ies)\b/i, polish: /aktywno/i },
    { key: "Verdict", english: /\bverdicts?\b/i, polish: /werdykt/i },
    { key: "Group", english: /\bgroups?\b/i, polish: /grup/i },
    { key: "Ranking", english: /\branking\b/i, polish: /ranking/i },
] as const;

/** Renderings that are wrong wherever they appear on a Polish page. */
export const WRONG = [
    { pattern: /\bsubmisj/i, instead: "Zgłoszenie" },
    { pattern: /\bbiegacz/i, instead: "Runner, untranslated" },
    { pattern: /\btask(i|ów|iem)?\b/i, instead: "Zadanie - `Task` was renamed to `Problem` in 2026-08" },
] as const;
