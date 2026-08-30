import { Callout } from "fumadocs-ui/components/callout";

/**
 * **A reader must never be shown English and left to assume it is the
 * translation.** Polish covers `/client/` and `/install/`; anywhere else a
 * Polish address renders the English page, and this says so on the page rather
 * than in a policy document the reader will not read.
 *
 * Under `0.x` releases an outdated or silently substituted installation
 * procedure is more dangerous than none, which is why the notice is visible
 * rather than a `lang` attribute nobody looks at.
 */
export function FallbackNotice({ locale }: { locale: string }) {
    if (locale !== "pl") return null;

    return (
        <Callout title="Ta strona jest po angielsku" type="warn">
            Polskie tłumaczenie obejmuje sekcje <strong>Korzystanie z AlgoJudge</strong>{" "}
            i <strong>Instalacja i utrzymanie</strong>. Pozostałe sekcje są
            materiałem technicznym i pozostają po angielsku.
        </Callout>
    );
}
