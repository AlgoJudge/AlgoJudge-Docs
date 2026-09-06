# The marks this site carries

**Copied, and checked.** `AlgoJudge-Assets` is the source of every mark in the
project, and its rule is that consumers copy from it rather than depend on it —
so these are copies, and the hashes below are how a copy is told from a
divergence.

| File here | Copied from | SHA-256 |
|---|---|---|
| `app/icon.svg` | `AlgoJudge-Website/src/app/icon.svg` | `2d7edce6bd38dab790c6bb668a5c1192d60b48e21b1852d01f08823462654a53` |
| `public/algojudge-dark.svg` | `AlgoJudge-Assets/logo/algojudge-dark.svg` | `fe2556adff207e4c51a30affe1445fec8a04161f9ca94d496418a9cb98bbc98a` |
| `components/algojudge-text.svg` | `AlgoJudge-Assets/logo/algojudge-text.svg`, at `80d5e19` | `7c6ba77e423dfa1b003cba8f7ee324b40bd0930a988b523df364ba7ac4a0c2f3` |

```bash
sha256sum app/icon.svg public/algojudge-dark.svg components/algojudge-text.svg
```

**Compare against the source as Git stores it, not as it sits on disk.** Both
source files are checked out with CRLF on a Windows workstation while Git holds
them with LF, so hashing the working copy gives a number that matches nothing
after a fresh clone:

```bash
git -C ../AlgoJudge-Assets show HEAD:logo/algojudge-dark.svg | sha256sum
git -C ../AlgoJudge-Assets show HEAD:logo/algojudge-text.svg | sha256sum
git -C ../AlgoJudge-Website show HEAD:src/app/icon.svg | sha256sum
```

**The square mark comes from `AlgoJudge-Website` rather than from Assets**, and
deliberately: Assets holds the wordmark, whose proportion is close to 7:1 and
unreadable at 32 pixels. The Website already derived a square icon from it for
`algojudge.pl`, and a documentation site on the same domain should carry the
same one rather than a second interpretation of the same mark.

## Two drawings of one mark, and they are not interchangeable

`public/algojudge-dark.svg` carries the wordmark as **outlines**;
`components/algojudge-text.svg` carries it as a live `<text>` asking for Inter
600. That is the whole difference, and each is right in exactly one place.

`public/og.png` is **generated** from the outlined one by `npm run og`, and
committed. Outlines are what make the card render identically wherever it is
built — no font has to be installed for the result to be right, and the line
endings above do not change a pixel of it.

`components/algojudge-text.svg` is drawn by `components/mark.tsx`, which
**inlines it into the page**. An SVG reached through `<img>` or a
`background-image` is rendered in a document of its own and cannot see the
embedding page's `@font-face`, so the live-text drawing only renders in Inter
where it is part of the document that ships Inter. That is why it sits beside a
component rather than in `public/`: nothing should be able to reach it by
address.

## The typefaces

**Sent, not named**, and self-hosted rather than linked: `deploy/security-headers.conf`
sends `font-src 'self' data:`, so a face from `fonts.gstatic.com` would be
blocked — and a visitor to a documentation site should not be announced to a
third party to read it.

Both families are **variable**: one file per subset covers the whole weight
range, which is four files rather than the twelve that static per-weight slices
would need. Taken 2026-09-07 from Google Fonts —
`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700` and
`…?family=JetBrains+Mono:wght@400;700` — whose upstreams are
`github.com/rsms/inter` and `github.com/JetBrains/JetBrainsMono`. Both are under
the **SIL Open Font License 1.1**, whose §2 wants the notice with every copy of
the font software; the copy that reaches a reader is the built one, and `public/`
is emitted verbatim, so the two licence texts live there.

| File here | SHA-256 |
|---|---|
| `app/fonts/inter-latin.woff2` | `34b9c504cab7a73e37b746343a449132e56cf7b5481af2cb81dc74dcff25c956` |
| `app/fonts/inter-latin-ext.woff2` | `5c66f9e07e90c6d4ac4922cc68d60de26c17b1858e677fb5e603fce3952b3ff2` |
| `app/fonts/jetbrains-mono-latin.woff2` | `db5ff4db83e580426280e9337a58dc57d3a83784a1b03ad80914651594441d52` |
| `app/fonts/jetbrains-mono-latin-ext.woff2` | `c89b9cc0bc6262bd4f8d8494b6961601f3aefa829d08c2e3635f4d501d3a47c2` |
| `public/OFL-Inter.txt` | `5b9321a4298cfeb6b34354164a1c3afc3db114569984c502b9b35d988fd58c57` |
| `public/OFL-JetBrainsMono.txt` | `a76abf002c49097d146e86740a3105a5d00450b1592e820a1109a8c5680cd697` |

```bash
sha256sum app/fonts/* public/OFL-*.txt
```

**This Inter is not the Inter `AlgoJudge-Client` ships.** That repository carries
Google's older static weight-600 slice, in which "AlgoJudge" at font-size 41
measures 215.52 user units; the current variable release draws the same string at
**187.02** — measured here on the rendered page, 2026-09-07. The drawing's
canvas is 270.1 units wide because it was sized against the wider one, so the
wordmark now leaves about 28 units of empty canvas to its right. Nothing is
clipped and nothing overlaps, and a check that asserted the Client's number
against this site would be asserting the wrong font.
