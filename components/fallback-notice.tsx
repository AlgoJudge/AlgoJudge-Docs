import { Callout } from "fumadocs-ui/components/callout";

import { polishSections } from "@/lib/sections";

/**
 * **A reader must never be shown English and left to assume it is the
 * translation.** Polish covers the sections `lib/sections.ts` marks, and
 * anywhere else a Polish address renders the English page. This says so on the
 * page rather than in a policy document the reader will not read.
 *
 * Under `0.x` releases an installation procedure quietly served in the wrong
 * language is worse than one that is missing, which is why the notice is visible
 * rather than a `lang` attribute nobody looks at. **The attribute is set too** —
 * `app/[lang]/[[...slug]]/page.tsx` marks the fallback body `lang="en"` —
 * because assistive technology is precisely what does look at it, and it is the
 * reader who cannot see this box.
 *
 * The section names are read from the record rather than typed here: the day a
 * third section gains Polish, a notice still naming two would be the thing
 * making a false claim.
 */
export function FallbackNotice({ locale }: { locale: string }) {
    if (locale !== "pl") return null;

    const named = polishSections.map((section) => section.title.pl);
    const list = named.slice(0, -1).join(", ");

    return (
        <Callout title="Ta strona jest po angielsku" type="warn">
            Polskie tłumaczenie obejmuje sekcje <strong>{list}</strong> i{" "}
            <strong>{named.at(-1)}</strong>. Pozostałe sekcje są materiałem
            technicznym i pozostają po angielsku.
        </Callout>
    );
}
