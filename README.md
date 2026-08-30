# AlgoJudge-Docs

AlgoJudge is open-source, self-hosted software for programming contests and
courses, with automatic evaluation of submitted solutions.

This repository is the **public documentation site** for it, published at
`docs.algojudge.pl`. It is a Fumadocs static export, served by nginx from an
image this repository builds.

**Status: not yet published.** `docs.algojudge.pl` has no DNS record, and no
product repository has cut a release, so nothing here is versioned yet — see
*Versions* below for what that means and what changes on release day.

## What is here, and what is not

It documents the five runtime repositories: `AlgoJudge-Server`,
`AlgoJudge-Client`, `AlgoJudge-Runner`, `AlgoJudge-Runner-UVa` and
`AlgoJudge-Ops`.

It is **not** `AlgoJudge-Design`. That repository holds internal working
documents with statuses, and a document does not appear here because it exists
there. Public documentation addresses a different reader in a different
register.

## Addresses

```
/{locale}/{section}/{version?}/{page}
```

The version segment sits **inside** the section, never before it, because the
products release independently. There is no single version of this site.

| Element | Values |
|---|---|
| `locale` | `en` (default), `pl` — always present in the URL |
| `section` | `install`, `client`, `server`, `runner`, `protocol` |
| `version` | `v0.1`, `v0.2`, … at minor granularity, or absent |

`/` redirects to `/en/`. That redirect is a web-server rule, not application
code: a static export runs no middleware.

**Every section has exactly one owning source and is versioned by that source's
releases.** A section without an owner has no honest version axis.
`lib/sections.ts` is the one place that records which is which.

## Languages

English covers every section. **Polish covers `/client/` and `/install/`** —
the two a participant, a manager and an administrator actually read — and is
versioned on the same axes. Accepted 2026-08-09.

A Polish address in any other section renders the English page **with a visible
notice saying so**, its body marked `lang="en"` for anything reading the page
aloud, and `noindex` so the same text is not indexed at two addresses. It is not
a 404 and it is not a silent substitution: under `0.x` releases an installation
procedure quietly served in the wrong language is worse than one that is
missing.

Polish pages use the words the interface itself uses. Those words are copied
into `lib/glossary.ts` from `AlgoJudge-Client/public/locales/pl/translation.json`
— **copied, because this is not a monorepo and CI checks out one repository** —
and `npm run check:glossary` re-checks the copy against the Client whenever the
Client happens to be on disk, so a rename there cannot pass unnoticed. `Problem`
is *Zadanie*, `Submission` is *Zgłoszenie*. A reader following a Polish page has
to be able to find the button it names.

## Versions

**Retention is total: nothing is deleted.** Under incompatible `0.x` releases,
old documentation is the only documentation that works for an existing
installation. Archived versions are served `noindex` with a banner naming the
current one, and **no `canonical`** — an older page is not the same page, and
pointing a reader at a newer procedure would be actively harmful.

**There are no version directories yet**, because no product repository carries
a `v*` tag. Today each section's content lives at its version-less path, which
*is* the page. On the day of the first release, `npm run snapshot` copies a
section to `v0.1/` and the version-less path becomes a 302 to the newest. There
is **no backfill**: a version directory is created on release day or not at all.

A snapshot writes three things, and **all three are committed**: the copied
pages, `versions.json` — which the build reads to decide what is archived — and
`deploy/redirects.conf`, which the image's nginx includes. It also rewrites the
copies' links and translation fingerprints to point inside the snapshot, so an
archive stops moving the moment it is cut.

## Building it

```bash
npm install
npm run build      # produces out/
```

Node comes from `.nvmrc`. `npm run build` first fetches the artefacts other
repositories own — today that is the Server's `openapi.json`, pinned in
`content-sources.json` — into `.sources/`, and generates the REST reference from
it into `content/docs/en/server/rest/`. **Neither is committed**: generated
output is not source.

| Command | What it does |
|---|---|
| `npm run build` | The static export, in `out/` |
| `npm run dev` | The development server |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript |
| `npm run check:links` | Every internal link resolves |
| `npm run check:versions` | No page is named so as to look like a version |
| `npm run check:translations` | No Polish page has drifted from its English source |
| `npm run check:structure` | A translation has the same headings, blocks and links as its source |
| `npm run check:glossary` | Polish uses the interface's own words, and every interface string has one |
| `npm run check:no-playground` | The built site contacts no installation |
| `npm run og` | Regenerate the Open Graph card from the wordmark |
| `npm run snapshot` | The release-day version snapshot |

### Two dependencies are deliberately not the newest

Both are the newest version that **works**, which is not the same thing, and
both were measured on 2026-08-30 rather than assumed:

- **TypeScript 6.0.3, not 7.0.2.** `typescript-eslint@8.68.0` — pulled in by
  `eslint-config-next` — declares `typescript >=4.8.4 <6.1.0` and refuses TS 7
  outright. `tsc` itself is happy on 7; the linter is not, and a repository
  whose linter does not run is worse off than one a major behind.
- **ESLint 9.39.5, not 10.9.1.** `eslint-plugin-react`, also inside
  `eslint-config-next`, calls `context.getFilename()`, which ESLint 10 removed.

Raise either only after checking that the other half of the toolchain has caught
up. Everything else here is the current release.

## How it presents itself

`https://docs.algojudge.pl` is written into `lib/site.ts` as a constant, not read
from the environment: a static export bakes `canonical`, `og:url` and the
sitemap in at build time, and a build that guessed the wrong host would publish
links to a site nobody serves. There is one deployment, so a variable would
suggest a choice it does not have.

Every page carries a description, a canonical address, Open Graph and Twitter
card tags, and `hreflang` alternates **only for languages that really have the
page** — a fallback is the English text at a Polish address, so advertising it
as a translation would be a lie to a crawler. Those, and archived versions,
carry `noindex` and stay out of `sitemap.xml`.

Page titles append the site: *Backup | AlgoJudge Docs*. The two landing pages
opt out, or they would say it twice.

The theme is Fumadocs' **ocean**. The favicon is the square mark
`algojudge.pl` already uses, and `public/og.png` is generated from the wordmark
— see `BRANDING.md` for where both came from and how to check the copies.

## Deploying it

```bash
docker build -t algojudge-docs .
docker compose up -d
```

The image serves **HTTP only**, and the host it runs on terminates TLS — the
same arrangement as the `algojudge-client` image. This site is deployed to
`docs.algojudge.pl` and nowhere else.

**`AlgoJudge-Ops` does not serve it.** Ops is an *installation's* stack: one
certificate, one site, `server_name _`, and the hostname taken from the request.
Putting our public documentation inside it would make every installation an
operator stands up serve it too. This changed the decision of 2026-08-09, which
had assigned the nginx rules to Ops; owner, 2026-08-30.

## Related repositories

| Repository | What this site takes from it |
|---|---|
| `AlgoJudge-Server` | the domain model, the permission model, and `openapi.json`, from which the REST reference is generated at build time |
| `AlgoJudge-Client` | every screen the `/client/` section describes, and the Polish glossary the Polish pages are checked against |
| `AlgoJudge-Runner` | what a Runner is, what it needs, and how it is isolated |
| `AlgoJudge-Runner-UVa` | the forwarding Runner, and why its verdict is somebody else's |
| `AlgoJudge-Ops` | everything in `/install/`. Ops is the subject of that section, not the host of this site |
| `AlgoJudge-Design` | the accepted Server–Runner contract, which prevails over `/protocol/` on any divergence |

## Where the decisions are

`AlgoJudge-Design/adr/DOCUMENTATION_SITE_2026-08-09.md` is the accepted decision
record, and `AlgoJudge-Design/specifications/docs/URL_CONTRACT.md` is the URL
contract in full. Both carry the corrections made when this repository was built
and the specification met the code.
