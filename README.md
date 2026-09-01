# AlgoJudge-Docs

AlgoJudge is open-source, self-hosted software for programming contests and
courses, with automatic evaluation of submitted solutions.

This repository is the **public documentation site** for it, published at
`docs.algojudge.pl`. It is a Fumadocs static export, served by nginx from an
image this repository builds.

## Documentation

The site this repository publishes is
**[docs.algojudge.pl](https://docs.algojudge.pl/en/)** — five sections, each at
`/{locale}/{section}/`:

| | |
|---|---|
| [`/en/install/`](https://docs.algojudge.pl/en/install/) | standing an installation up, and keeping it running |
| [`/en/client/`](https://docs.algojudge.pl/en/client/) | every screen, the participant's and the manager's |
| [`/en/server/`](https://docs.algojudge.pl/en/server/) | the model, the permission model, and the REST reference |
| [`/en/runner/`](https://docs.algojudge.pl/en/runner/) | evaluation, isolation, languages and routing |
| [`/en/protocol/`](https://docs.algojudge.pl/en/protocol/) | the contract between a Server and a Runner |

`/install/` and `/client/` are also in Polish. Everything below is how the site
is built rather than what it says.

## What is here, and what is not

It documents the five runtime repositories:
[`AlgoJudge-Server`](https://github.com/AlgoJudge/AlgoJudge-Server),
[`AlgoJudge-Client`](https://github.com/AlgoJudge/AlgoJudge-Client),
[`AlgoJudge-Runner`](https://github.com/AlgoJudge/AlgoJudge-Runner),
[`AlgoJudge-External-Runner`](https://github.com/AlgoJudge/AlgoJudge-External-Runner)
and [`AlgoJudge-Ops`](https://github.com/AlgoJudge/AlgoJudge-Ops).

**Public documentation is written here**, for a reader who does not have the
source open. That is a different register from an internal working document, and
nothing is published because it was written somewhere else — a page says what
the code does.

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

**`/` redirects to the language the reader asked for**, `/pl/` or `/en/`, from
`Accept-Language`. That redirect is a web-server rule, not application code: a
static export runs no middleware, so it is a `map` in `deploy/nginx.conf` and a
`location` in `deploy/redirects.conf`. **The first tag in the header decides** —
browsers send the list in preference order, and ranking `q=` values is not
something a `map` can do. Anything that is not Polish, and a request with no
header, is English.

`app/(root)/page.tsx` answers `/` wherever that rule does not run, by reading
`navigator.languages` — the browser's own copy of the same list, matched by the
same rule. Two cases reach it: `next dev`, which has no way to read a header, and
a host serving `out/` with a configuration of its own. **Nothing inside the site
links to `/`**: the mark at the top of the sidebar goes to the front page of the
language being read, and the language picker is what changes language.

**Every section has exactly one owning source and is versioned by that source's
releases.** A section without one has no honest version axis.
`lib/sections.ts` is the one place that records which is which.

## Languages

English covers every section. **Polish covers `/client/` and `/install/`** —
the two a participant, a manager and an administrator actually read — and is
versioned on the same axes.

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
current one, and **no `canonical`** — an older page is not the same page.

**There are no version directories yet**, because no product repository carries
a `v*` tag. Today each section's content lives at its version-less path, which
*is* the page. On the day of the first release, `npm run snapshot` copies a
section to `v0.1/` and the version-less path becomes a 302 to the newest. There
is **no backfill**: a version directory is created on release day or not at all.

A snapshot writes three things and **all three are committed**: the copied
pages, `versions.json` and `deploy/redirects.conf`, which the image's nginx
includes.

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
| `npm run check:fonts` | Every page is painted with the faces this site ships — needs a served site, so it runs locally rather than in CI |
| `npm run og` | Regenerate the Open Graph card from the wordmark |
| `npm run snapshot` | The release-day version snapshot |

The theme is Fumadocs' **ocean**, set in **Inter** with **JetBrains Mono** for
code, both shipped with the site rather than named. The mark at the top of the
sidebar is the wordmark, inlined into the page so that it renders in the face it
asks for; the favicon is the square mark `algojudge.pl` already uses, and
`public/og.png` is generated from the outlined drawing.
[BRANDING.md](BRANDING.md) says where each came from and how to check the copies.

### Two dependencies are deliberately not the newest

Both are the newest version that **works**, which is not the same thing:

- **TypeScript 6.0.3, not 7.0.2.** `typescript-eslint@8.68.0` — pulled in by
  `eslint-config-next` — declares `typescript >=4.8.4 <6.1.0` and refuses TS 7
  outright. `tsc` itself is happy on 7; the linter is not, and a repository
  whose linter does not run is worse off than one a major behind.
- **ESLint 9.39.5, not 10.9.1.** `eslint-plugin-react`, also inside
  `eslint-config-next`, calls `context.getFilename()`, which ESLint 10 removed.

Raise either only after checking that the other half of the toolchain has caught
up. Everything else here is the current release.

## Deploying it

```bash
docker build -t algojudge-docs .
docker compose up -d
```

The image serves **HTTP only**, and the host it runs on terminates TLS — the
same arrangement as the `algojudge-client` image. This site is deployed to
`docs.algojudge.pl` and nowhere else, which is why that address is a constant in
`lib/site.ts` rather than an environment variable: a static export bakes
`canonical`, `og:url` and the sitemap in at build time, so a build that guessed
the wrong host would publish links to a site nobody serves.

**`AlgoJudge-Ops` does not serve it.** Ops is an *installation's* stack: one
certificate, one site, `server_name _`, and the hostname taken from the request.
Putting our public documentation inside it would make every installation an
operator stands up serve it too.

## Related repositories

| Repository | What this site takes from it |
|---|---|
| [`AlgoJudge-Server`](https://github.com/AlgoJudge/AlgoJudge-Server) | the domain model, the permission model, and `openapi.json`, from which the REST reference is generated at build time |
| [`AlgoJudge-Client`](https://github.com/AlgoJudge/AlgoJudge-Client) | every screen the `/client/` section describes, and the Polish glossary the Polish pages are checked against |
| [`AlgoJudge-Runner`](https://github.com/AlgoJudge/AlgoJudge-Runner) | what a Runner is, what it needs, and how it is isolated |
| [`AlgoJudge-External-Runner`](https://github.com/AlgoJudge/AlgoJudge-External-Runner) | the forwarding Runner, and why its verdict is somebody else's |
| [`AlgoJudge-Ops`](https://github.com/AlgoJudge/AlgoJudge-Ops) | everything in `/install/`. Ops is the subject of that section, not the host of this site |

## Contributing

Open an issue saying what you expected, what happened, and how to reproduce it.
Or open a pull request against `main`: one subject per pull request, with a note
on what changes and why.

By contributing you agree that your work is licensed under the terms below.

## License

This project's code is licensed under the MIT License.
See [LICENSE](LICENSE).

The documentation is licensed under CC BY 4.0.
See [LICENSE-DOCS](LICENSE-DOCS).

Authors are listed in [AUTHORS.txt](AUTHORS.txt).
