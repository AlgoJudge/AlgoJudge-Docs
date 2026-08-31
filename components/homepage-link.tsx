import { ExternalLink } from "lucide-react";

import { HOMEPAGE } from "@/lib/site";

const text: Record<string, string> = {
    en: "The project",
    pl: "Strona projektu",
};

/**
 * The way back out of the documentation, in the sidebar footer.
 *
 * **`-order-1` is what puts it above the language picker.** Fumadocs' sidebar
 * renders its footer slot last — after the picker and after the icon row — and
 * offers no slot between them. The container is a flex column, so ordering the
 * one element rather than overriding the whole component is the smaller change,
 * and it survives an upgrade that adds something else to that footer.
 */
export function HomepageLink({ locale }: { locale: string }) {
    return (
        <a
            href={HOMEPAGE}
            className="-order-1 mb-2 flex items-center gap-2 px-2 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
        >
            <ExternalLink className="size-4 shrink-0" />
            {text[locale] ?? text.en}
        </a>
    );
}
