import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The product's mark, at the top of the sidebar.
 *
 * ## Inlined into the document, and that is the whole of why this file exists
 *
 * `algojudge-text.svg` carries the wordmark as a live `<text>` in Inter 600
 * rather than as outlines. **An SVG reached through `<img>` is rendered in a
 * document of its own and cannot see the embedding page's `@font-face`** —
 * measured in `AlgoJudge-Client`, where through an `<img>` it came out in a
 * system fallback, wider than its own viewBox, with the last letters clipped.
 * Inlining is what puts the drawing inside the document that ships Inter.
 *
 * The Client injects the file with Vite's `?raw`; there is no Vite here, so the
 * file is read instead. `output: "export"` means every page is prerendered, so
 * this read happens once, while the site is being built, and never in a request.
 *
 * `dangerouslySetInnerHTML` is the cost, and it is safe for the reason the name
 * warns about: the markup is a file in this repository, copied byte for byte
 * from `AlgoJudge-Assets`, never anything a reader supplied. **Do not transcribe
 * it into JSX** — a hand-written copy is a divergent variant that stops
 * following its source, and `BRANDING.md` records a checksum that would then be
 * of nothing.
 *
 * ## One file rather than the light/dark pair
 *
 * Assets ships two drawings that differ only in `fill`. Taking both would put a
 * second copy of every `id` in the drawing — `logo`, `gavel`, `text`, `tspan395`
 * — into one document. `fill: currentColor` beats the presentation attribute
 * instead, so the mark is drawn in the colour of the text beside it and needs
 * nothing to switch when the theme does.
 *
 * `overflow: visible` because an outermost `<svg>` clips to its viewport, and
 * the face arrives with `font-display: swap`: for the moment before it does,
 * the wordmark is set in whatever the machine has, and an overhang is a better
 * failure than a sliced-off letter.
 */
const drawing = readFileSync(
    path.join(process.cwd(), "components", "algojudge-text.svg"),
    "utf8",
);

export function Mark({ className = "" }: { className?: string }) {
    return (
        <span
            role="img"
            aria-label="AlgoJudge"
            className={`block h-5 [&_g]:fill-current [&>svg]:block [&>svg]:h-full [&>svg]:w-auto [&>svg]:overflow-visible ${className}`}
            dangerouslySetInnerHTML={{ __html: drawing }}
        />
    );
}
