# Releasing the documentation site

For whoever cuts the release. A reader of the site wants the site.

## This site has no single version

**It is versioned per section, by the releases of the repository each section
documents** — `lib/sections.ts` holds which is which. `/install/` moves when
`AlgoJudge-Ops` releases, `/server/` when the Server does. `package.json` says
`1.0.0` and means nothing; nothing publishes this package.

The version axis is **minor granularity**: `v0.1`, `v0.2`. A patch release
updates the directory it already has.

## There is no release workflow here

The other four repositories publish an image on a `v*` tag. **This one does
not.** CI builds `algojudge-docs:ci` as a check and pushes nothing, so the image
`compose.yaml` runs is built from this repository and pushed by whoever deploys
the site.

That is the honest state today: `docs.algojudge.pl` has **no DNS record and no
chosen host**. Until it has both, a release here means the snapshot below and
nothing more.

## On release day, after the tags exist

The snapshot is cut **on release day or not at all**. There is no backfill: no
honest way exists to reconstruct later what a page said at a release, and a
reconstruction is worse than an absence because it looks authoritative.

```bash
npm run snapshot -- v0.1            # every section
npm run snapshot -- v0.1 install    # or one at a time, as each repository releases
```

Each section is cut when **its own** repository releases, not when any of them
does. `/install/` gains `v0.1/` holding exactly what the version-less path said
that day, and the version-less path becomes a redirect to it.

## Before publishing

- [ ] `npm run lint`, `typecheck`, `build`.
- [ ] `check:links`, `check:versions`, `check:translations`, `check:structure`,
      `check:glossary`, `check:section-links`, `check:no-playground` — all seven.
- [ ] **`check:fonts`, which none of the above and no CI run covers.** It needs
      a served site and a real browser, so it is run by hand: `npm run build`,
      serve `out/`, then `URL=… npm run check:fonts`. It asks Chrome which
      faces painted each page, which is the only way a wrong subset shows up —
      the stylesheet and `document.fonts` both report success for it.
- [ ] **`content-sources.json` is pinned at the commit that was released**, not
      at whatever `main` was. It carries the Server commit the REST reference is
      generated from, with a checksum that is verified after the download.
- [ ] The image builds and serves: `docker build -t algojudge-docs:ci .` and the
      run CI does afterwards.
- [ ] `.env.example` and `compose.yaml` name the same image tag, and it is a
      version rather than `latest`.
- [ ] **`/install/` still matches `AlgoJudge-Ops`.** That section is written from
      `docs/` there, nothing checks the two against each other, and the gap is
      invisible while every check is green. Comparing `.env.example` key by key
      against `install/configuration` is the cheapest way to see it.
- [ ] The Polish pages carry the change rather than the fingerprint being
      refreshed to silence the check. `check:translations` compares a hash and
      `check:structure` an outline; **neither reads the prose**.

## The one thing a green suite does not tell you

Only `en/server/meta.json` carries the `"..."` wildcard. **Everywhere else a page
missing from `pages` does not appear at all** — with every check green and the
build succeeding. After adding a page, grep the built `out/` for a link to it.
