# AlgoJudge-Docs

The public documentation site for `docs.algojudge.pl`. Read `README.md` first —
it carries the URL grammar, the language policy and the version rules, and this
file does not repeat them.

## What this repository is for

**Public documentation, addressed to a reader who does not have the source
open.** It documents five repositories: Server, Client, Runner, Runner-UVa and
Ops.

It is not `AlgoJudge-Design`. Design holds internal working documents that carry
a status; a `Draft` there is not a fact here. **Nothing is published here
because it exists there.**

## The rule that matters most

**Document what the code does, not what a specification proposes.**

`docs/specs/MANAGER_PANEL.md`, `PARTICIPANT_SCREENS.md`, `PERMISSIONS.md` and
`PRECONFIGURATION.md` in the workspace are all `Draft`. They are the right place
to learn the vocabulary and the intent. They are not a source for a claim on a
public page — the code is. Where the two disagree, the code is what a reader
will meet.

Two known traps:

- `/manager/workstations` and `/manager/printers` appear in
  `AlgoJudge-Client/src/pages/manager/managerAreas.ts` with `soon: true` and have
  **no route**. They are not features.
- **No release has been cut.** `ghcr.io/algojudge` is empty, so every
  `docker pull` instruction describes an intended path, and `/install/` says so
  rather than letting a reader discover it.

## Language

- **English is the source language.** Every page is written in English first.
- **Polish covers `/client/` and `/install/` only**, and is written *with* the
  English rather than translated from it afterwards.
- **Polish uses the interface's own words.** They live in `lib/glossary.ts`,
  copied from `AlgoJudge-Client/public/locales/pl/translation.json` because CI
  checks out one repository — and `npm run check:glossary` re-checks the copy
  against the Client whenever it is on disk. `Problem` is *Zadanie*,
  `Submission` is *Zgłoszenie*, `Activity` is *Aktywność*.
- **The interface's own Polish is in `lib/ui-translations.ts`**, and the same
  check verifies every key Fumadocs emits has one. Its keys *are* the English
  strings, so a renamed key does not go missing — it silently renders in
  English.
- Every Polish page records the fingerprint of the English source it was written
  from, in its front matter. `npm run check:translations` fails when the English
  moves and the Polish does not.

## Terminology

`Activity`, `Problem`, `Submission`, `EvaluationJob`, `Runner`. **`Task` was
renamed to `Problem` on 2026-08-03 and must not come back.** The integrity field
is `sha256`, never `hash`; in prose, SHA-256.

## Content conventions

- One section per top-level content directory, each with `"root": true` in its
  `meta.json`. That is what gives a section its own sidebar.
- **Every internal link is absolute and carries its locale** — `/en/install/backup`,
  never `/install/backup`. The locale is always in the URL (`hideLocale: "never"`),
  so a link without one is an address nobody serves. `npm run check:links`
  refuses both that and a link to a page that does not exist.
  `scripts/snapshot.mjs` rewrites these when it cuts a version, so a snapshot's
  links stay inside the snapshot.
- **No page directly under a section may be named to match `^v\d`.** That is the
  only thing separating a version segment from a page segment.
  `npm run check:versions` refuses it.
- Generated content is not committed: the REST reference under
  `content/docs/en/server/rest/` and everything in `.sources/` are build output.
- **A section links its own repository from the foot of its sidebar**, written as
  an `external:` entry last in its `meta.json`. Which repository is
  `lib/sections.ts`, not the `meta.json` — a section that documents no
  repository a reader should open declares `repository: null` and links nothing.
  `npm run check:section-links` holds the two halves together.

## Before a pull request

```bash
npm run lint && npm run typecheck && npm run build
npm run check:links && npm run check:versions
npm run check:translations && npm run check:structure && npm run check:glossary
npm run check:section-links && npm run check:no-playground
```

**A new check is not trusted until it has been shown to fail.** Break the thing
it is meant to catch, watch it go red, put it back.

## Licence

**The code is MIT and the pages are CC BY 4.0**, and `README.md` has the table
that says which is which. A page carries prose under CC BY and its samples under
MIT, so a reader pasting a command owes nobody a credit. `LICENSE-DOCS` is
Creative Commons' own legal code, byte for byte — do not edit it.

## Versions and dependencies

Two dependencies are held below the newest release on purpose, and `README.md`
says which and why. Raising either without checking the other half of the
toolchain will stop the linter running.
