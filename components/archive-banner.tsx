import { Callout } from "fumadocs-ui/components/callout";

import type { ArchiveState } from "@/lib/versions";

const TEXT = {
    en: (a: ArchiveState) => ({
        title: `This describes ${a.version}, and ${a.newest} is current`,
        body: "It is kept because an installation still running this version needs it. If you are running something newer, what is written here may not work.",
        link: "The current version",
    }),
    pl: (a: ArchiveState) => ({
        title: `Ta strona opisuje ${a.version}, a aktualna wersja to ${a.newest}`,
        body: "Zostaje, bo instalacja, która wciąż działa na tej wersji, jej potrzebuje. Jeżeli masz nowszą, to, co tu napisano, może nie zadziałać.",
        link: "Aktualna wersja",
    }),
} as const;

/**
 * **No `canonical`, and that is the decision rather than an omission.** An
 * archived page is not the newest page under a different address: pointing a
 * reader at a procedure written for a version they are not running is the harm
 * retention exists to prevent. The link is offered, not substituted.
 */
export function ArchiveBanner({ state, locale }: { state: ArchiveState; locale: string }) {
    const text = (TEXT[locale as keyof typeof TEXT] ?? TEXT.en)(state);

    return (
        <Callout title={text.title} type="warn">
            {text.body}{" "}
            <a href={`/${locale}/${state.section}/${state.newest}/`}>{text.link}</a>
        </Callout>
    );
}
