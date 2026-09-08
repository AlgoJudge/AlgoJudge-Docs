"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";

/**
 * A diagram, drawn in the reader's browser.
 *
 * **The library is imported inside the effect and nowhere else.** Mermaid is
 * larger than every other dependency on this site put together, and importing
 * it at the top of this file would put it in the chunk every page loads rather
 * than in one fetched by the pages that draw something — twenty-four of them
 * since 2026-09-08, where there were two.
 *
 * **It renders under the site's own policy, unweakened.**
 * `deploy/security-headers.conf` grants `script-src 'self' 'unsafe-inline'` and
 * no `'unsafe-eval'`; a flowchart and a sequence diagram need none, and the
 * `'unsafe-inline'` under `style-src` — already there — is the one thing mermaid
 * does require, for the stylesheet it puts beside each diagram. If a diagram
 * type ever wants `eval`, the answer is to render it at build time and not to
 * edit that file.
 */
export function Mermaid({ chart }: { chart: string }) {
    const id = useId().replace(/:/g, "");
    const { resolvedTheme } = useTheme();
    const holder = useRef<HTMLDivElement>(null);
    // `drawing` until one of the other two happens. **Three states and not a
    // boolean**, because the source may only be shown once drawing has
    // actually failed — a boolean starting at `false` shows it on every load,
    // for as long as the import takes.
    const [state, setState] = useState<"drawing" | "drawn" | "failed">("drawing");

    useEffect(() => {
        // **Superseded effects must not write.** The theme can change while an
        // import is in flight, and two renders landing in either order would
        // leave a dark diagram on a light page half the time.
        let current = true;

        void (async () => {
            const { default: mermaid } = await import("mermaid");
            mermaid.initialize({
                startOnLoad: false,
                // Mermaid runs the result through DOMPurify at this level and
                // refuses click handlers in the source. Nothing here comes from
                // a reader, and it costs nothing to say so.
                securityLevel: "strict",
                theme: resolvedTheme === "dark" ? "dark" : "default",
                fontFamily: "inherit",
            });

            try {
                const { svg } = await mermaid.render(`mermaid-${id}`, chart);
                if (!current || !holder.current) return;
                holder.current.innerHTML = svg;
                setState("drawn");
            } catch {
                // **The source stays on the page.** A diagram that failed to
                // draw is a page with a gap in it otherwise, and the text is
                // what the `<noscript>` below would have shown anyway.
                if (current) setState("failed");
            }
        })();

        return () => {
            current = false;
        };
    }, [chart, id, resolvedTheme]);

    return (
        <figure className="my-6 overflow-x-auto">
            <div ref={holder} className="flex justify-center [&_svg]:max-w-full" />
            {/*
              **What a reader without JavaScript meets.** `<noscript>` rather
              than a visible block this effect then replaces: the second flashes
              the source on every load, and the first costs nothing.
            */}
            <noscript>
                <pre>
                    <code>{chart}</code>
                </pre>
            </noscript>
            {state === "failed" && (
                <pre>
                    <code>{chart}</code>
                </pre>
            )}
        </figure>
    );
}
