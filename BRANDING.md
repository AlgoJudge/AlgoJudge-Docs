# The marks this site carries

**Copied, and checked.** `AlgoJudge-Assets` is the source of every mark in the
project, and its rule is that consumers copy from it rather than depend on it —
so these are copies, and the hashes below are how a copy is told from a
divergence.

| File here | Copied from | SHA-256 |
|---|---|---|
| `app/icon.svg` | `AlgoJudge-Website/src/app/icon.svg` | `2d7edce6bd38dab790c6bb668a5c1192d60b48e21b1852d01f08823462654a53` |
| `public/algojudge-dark.svg` | `AlgoJudge-Assets/logo/algojudge-dark.svg` | `beec487f41ff47c14b664c69111ed56da656c3ddec5cb1ac594865c325078332` |

```bash
sha256sum app/icon.svg public/algojudge-dark.svg
```

**Compare against the source as Git stores it, not as it sits on disk.** Both
source files are checked out with CRLF on a Windows workstation while Git holds
them with LF, so hashing the working copy gives a number that matches nothing
after a fresh clone:

```bash
git -C ../AlgoJudge-Assets show HEAD:logo/algojudge-dark.svg | sha256sum
git -C ../AlgoJudge-Website show HEAD:src/app/icon.svg | sha256sum
```

**The square mark comes from `AlgoJudge-Website` rather than from Assets**, and
deliberately: Assets holds the wordmark, whose proportion is close to 7:1 and
unreadable at 32 pixels. The Website already derived a square icon from it for
`algojudge.pl`, and a documentation site on the same domain should carry the
same one rather than a second interpretation of the same mark.

`public/og.png` is **generated** from `public/algojudge-dark.svg` by
`npm run og`, and committed. The wordmark is paths rather than text, so the card
renders identically wherever it is built — no font has to be installed for the
result to be right, and the line endings above do not change a pixel of it.
