# Releasing the documentation site

For whoever cuts the release. A reader of the site wants the site.

Everything below was checked against this repository on **2026-09-07**, on
`release/0.1.0`. **The five product repositories carry `v0.1.0` since 2026-09-08
and their eight images are public** — this site is the one that has not been
released, which is what the list below is for.

## This site has no single version

**It is versioned per section, by the releases of the repository each section
documents.** `/install/` moves when `AlgoJudge-Ops` releases, `/server/` when the
Server does. `package.json` says `1.0.0` and means nothing; nothing publishes
this package.

`lib/sections.ts` names the repository each section *documents*. It no longer
names the one whose releases *move* it — the `owner` field that did was removed
on 2026-09-01 for being read by nothing — so the mapping is here:

| Section | Released by |
|---|---|
| `/install/` | `AlgoJudge-Ops` |
| `/client/` | `AlgoJudge-Client` |
| `/server/` | `AlgoJudge-Server` |
| `/runner/` | `AlgoJudge-Runner` |
| `/protocol/` | nothing — see below |

`/protocol/` describes contract **v1.1**, whose accepted specification lives in
`AlgoJudge-Design`. That repository is private, carries no `v*` tag and publishes
no image, so no release moves this section and its `repository` is `null`.
**Whether it gets a `v0.1` directory at all is undecided, and this runbook does
not decide it** — but the decision cannot be deferred past release day, because
there is no backfill.

`AlgoJudge-External-Runner` releases and moves no section of its own. What its
release changes is prose inside `/install/` and `/runner/`.

The version axis is **minor granularity**: `v0.1`, `v0.2`. A patch release
updates the directory it already has, and `npm run snapshot -- v0.1.0` is refused
as usage.

## There is no release workflow here

Server, Client, Runner and External-Runner each carry
`.github/workflows/release.yml`, triggered `on: push: tags: ['v*']`, and each
pushes an image on a tag. **`AlgoJudge-Ops` and this repository carry none** —
Ops has only `check.yml`, and CI here builds `algojudge-docs:ci` as a check and
pushes nothing. So the image `compose.yaml` runs is built and pushed by whoever
deploys the site, which is what `.env.example` means when it points here.

That is the honest state today: `docs.algojudge.pl` has **no DNS record and no
chosen host**. Until it has both, a release here means the snapshot below, the
commits, and nothing more.

## The order across repositories is fixed

1. **Server and Client.**
2. **Runner** — its own image and the four language images, one version.
3. **External-Runner, after the Runner and never beside it.**
   `AlgoJudge-External-Runner/Cargo.toml:15` pins `aj-protocol` to a **git
   revision** of `AlgoJudge-Runner`, because the Runner publishes no crate. That
   revision has to be the Runner's released commit before this tag is pushed.
4. **Ops**, last. It builds nothing and pulls every image by tag, so there is
   nothing for it to pull until the four above exist.
   `AlgoJudge-Ops/docs/RELEASE.md` states the same order.

Each section of this site is snapshotted when **its own** repository releases, so
this repository is touched on more than one of those days.

## The snapshot is cut on the day, or not at all

There is no backfill: no honest way exists to reconstruct later what a page said
at a release, and a reconstruction is worse than an absence because it looks
authoritative.

```bash
npm run snapshot -- v0.1 install    # one section, as its repository releases
npm run snapshot -- v0.1            # or every section, if they release together
```

Checked 2026-09-07 against a copy of this tree: `-- v0.1 install` copied 34 files
across both locales, wrote `versions.json` and `deploy/redirects.conf`, and
refused a second run over a directory that already existed. Cutting one section
rewrites both generated files from **every** version directory present, so a
later section does not undo an earlier one. The suite stayed green afterwards
(523 links, 64 Polish pages).

Then, still on that day:

- [ ] **`lib/site.ts`: `documented.released` from `null` to `"0.1"`.** Nothing
      sets it — `scripts/snapshot.mjs` does not touch this file — and
      `lib/layout.shared.tsx` renders it beside the title on every page, so
      until it is changed a released site says *unreleased* and *przed 0.1*.
      It names the product rather than a section, so it changes once, on the
      first of these releases.
- [x] **The pre-release warnings are out.** They stopped being true when the
      products released rather than when this site does, so they came out then:
      `content/docs/{en,pl}/install/first-install.mdx`,
      `content/docs/{en,pl}/install/index.mdx`, and the *Which version this is*
      paragraph on both front pages. Nothing anywhere still says nothing has
      been released.
- [x] **The eight GHCR packages are public.** A package created by its first push
      is private and no workflow can change that; somebody with access to the
      organisation's packages set each to Public on 2026-09-08. It returns with
      every new image, so it stays on this list.
- [ ] **Commit the copied pages, `versions.json` and `deploy/redirects.conf`.**
      All three are read from the build context: `versions.json` by `next build`
      inside the image, `deploy/redirects.conf` by the runtime stage's `COPY`.

## Before publishing

- [ ] `npm run lint`, `npm run typecheck`, `npm run build`. All three pass on
      `release/0.1.0` as of 2026-09-07; the build produced 262 static pages.
- [ ] `check:links`, `check:versions`, `check:translations`, `check:structure`,
      `check:glossary`, `check:section-links`, `check:no-playground` — the seven
      CI runs. All seven pass as of 2026-09-07.
- [ ] **Run `check:glossary` from the workspace, not from a bare clone.** It
      compares `lib/glossary.ts` against
      `../AlgoJudge-Client/public/locales/pl/translation.json` only when that
      repository is on disk, and *says* it skipped rather than failing. Green
      from a clone means two of its three parts ran.
- [ ] **`check:fonts`, which is the eighth check and which no CI run covers.**
      It needs a served site and a real browser:

      ```bash
      npm run build
      (cd out && python -m http.server 8099 --bind 127.0.0.1) &
      URL=http://127.0.0.1:8099 npm run check:fonts
      ```

      `URL` takes no trailing slash. Its default is `http://127.0.0.1:3000`,
      which is `next dev` — a different artefact from the export that ships, so
      pass the served `out/` explicitly. **Playwright is resolved out of
      `../AlgoJudge-Client/node_modules`** (`CLIENT_DIR` overrides the
      location), so that repository has to be checked out beside this one with
      its dependencies installed; Playwright closes the browser it starts.
      Checked 2026-09-07 against `out/` served exactly that way: 16 assertions,
      all passing, both locales.

      It asks Chrome which faces painted each page, which is the only way a
      wrong subset shows up — the stylesheet and `document.fonts` both report
      success for it.
- [ ] **`content-sources.json` is pinned at the commit that was released**, not
      at whatever `main` was. Today it pins Server commit `e01247c1` of
      2026-09-04, which is on the Server's `main` and `release/0.1.0` but is not
      their tip. On release day set `ref` to the Server's tag, `refKind` to
      `tag`, `refDate` to that day, and recompute `sha256`:

      ```bash
      curl -sSL https://raw.githubusercontent.com/AlgoJudge/AlgoJudge-Server/v0.1.0/openapi.json | sha256sum
      rm -rf .sources && npm run build
      ```

      The `rm -rf` is not optional if you want the download exercised: a cached
      file whose hash already matches is left alone and never touched the
      network. **Only `repository`, `path`, `ref` and `sha256` are read** —
      `scripts/sync-sources.mjs` never looks at `refKind` or `refDate`, so a
      wrong value there fails nothing and misleads whoever reads it next.
      Checked 2026-09-07 by deleting the cache: the pin fetched from GitHub and
      the checksum matched.
- [ ] **The image builds and serves.** Checked 2026-09-07:
      `docker build -t algojudge-docs:ci .` succeeds, and the run CI does
      afterwards passes — `/healthz`, `/en/`, `/pl/`, `/en/install/`,
      `/pl/install/`, `/en/server/rest/` and both search endpoints answer 200,
      `/` answers 302, and the three security headers reach a `_next` chunk.
      `/` negotiates: `Accept-Language: pl` to `/pl/`, anything else and an
      absent header to `/en/`.
- [ ] **Then the tag it deploys under**, which no workflow will do for you:
      `docker build -t ghcr.io/algojudge/algojudge-docs:0.1.0 .` and a push. The
      package will be private on its first push like the others, and it is a
      ninth rather than one of the eight an installation needs — an installation
      never pulls it. Leaving it private only means whoever deploys the site
      needs `docker login ghcr.io`.
- [ ] **`.env.example` and `compose.yaml` name the same image tag, and it is a
      version rather than `latest`.** Both say
      `ghcr.io/algojudge/algojudge-docs:0.1.0`, and the three keys match in both
      directions — `DOCS_IMAGE`, `DOCS_BIND`, `DOCS_PORT`, with the same
      defaults, and nothing in the code reads an environment variable either
      file does not name. Checked 2026-09-07.
- [ ] **No `.env` is committed.** `git ls-files | grep env` returns
      `.env.example` alone, and none exists in the working tree; `.gitignore`
      excludes `.env*` bar the example and `.dockerignore` does the same for the
      build context. Checked 2026-09-07.
- [ ] **`/install/` still matches `AlgoJudge-Ops`.** That section is written from
      `docs/` there, nothing checks the two against each other, and the gap is
      invisible while every check is green. Comparing `.env.example` key by key
      is the cheapest way in, but **against the whole section rather than against
      `install/configuration`**: `TZ` is also on `install/schedule`,
      `RUNNER_1_CPUSET` on `install/requirements`, `RUNNER_STOP_GRACE` on
      `install/update`. Include the keys Ops comments out, `BACKUP_KEEP_DAILY`
      among them.

      ```bash
      grep -ohE '^#? *[A-Z][A-Z0-9_]{2,}=' ../AlgoJudge-Ops/.env.example \
        | sed 's/^# *//; s/=$//' | sort -u > /tmp/ops
      grep -rhoE '[A-Z][A-Z0-9_]{2,}' content/docs/en/install | sort -u > /tmp/docs
      comm -23 /tmp/ops /tmp/docs
      ```

      On 2026-09-07 that left seven, of which **four are real**:
      `EXTERNAL_RUNNER_STOP_GRACE`, `RUNNER_NAME_PREFIX`, `SERVER_LOG` and
      `SERVER_STOP_GRACE` appear nowhere in `content/`, in either language.
      `RUNNER_2_CPUSET` and its two siblings are covered by *and its siblings* on
      `install/requirements`.

      The keys are the cheap half. Also read `AlgoJudge-Ops/docs/INSTALL.md`,
      `OPERATIONS.md` and `TROUBLESHOOTING.md` against the pages that mirror
      them, and Ops's `compose.yaml` services and profiles against the table on
      `install/index`. Whatever the English gains, the Polish gains with it —
      `check:translations` will say so, and the fix is the prose.
- [ ] **The Polish pages carry the change rather than the fingerprint being
      refreshed to silence the check.** `check:translations` compares a hash and
      `check:structure` an outline; **neither reads the prose**.

## Tools and dependencies, checked 2026-09-07

Run `npm outdated` and `npm audit` **read-only**. The lockfile must not move: no
`npm install`, no `npm update`, no `npm audit fix`.

- `npm audit`: **0 vulnerabilities** across 830 dependencies.
- **Node 24**, agreeing in `.nvmrc`, the `Dockerfile` (`node:24-alpine`) and CI's
  `node-version-file`. That is the current LTS line — `v24.20.0`, Krypton.
- **Two holds are deliberate**, and `README.md` says why. **TypeScript 6.0.3, not
  7.0.2**: `typescript-eslint@8.68.0`, inside `eslint-config-next`, refuses TS 7.
  **ESLint 9.39.5, not 10.10.0**: `eslint-plugin-react` calls
  `context.getFilename()`, which ESLint 10 removed. Do not raise either to clear
  `npm outdated`; raise them when the other half of the toolchain has caught up.
- **Eight more are behind and are not held**: `next` and `eslint-config-next`
  16.3.3 against 16.3.4, `fumadocs-core` and `fumadocs-ui` 16.15.4 against
  16.15.7, `fumadocs-openapi` 11.3.5 against 11.4.1, `postcss` 8.5.26 against
  8.5.28, `@types/node` 26.4.0 against 26.4.1, `@types/react-dom` 19.2.5 against
  19.2.7. Every one is a patch or a minor. `README.md` still says everything
  outside the two holds is the current release.
- **The nginx base is a superseded stable branch.** The `Dockerfile` pins
  `nginx:1.29-alpine`, last pushed 2026-04-17. `stable-alpine` is now
  `1.30.4-alpine`, pushed 2026-09-03. This is the image that faces the public
  internet, so raise it before publishing rather than after.

## The one thing a green suite does not tell you

Only `en/server/meta.json` carries the `"..."` wildcard. **Everywhere else a page
missing from `pages` does not appear at all** — with every check green and the
build succeeding. After adding a page, grep the built `out/` for a link to it.
