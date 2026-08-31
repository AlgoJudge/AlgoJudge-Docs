/**
 * **The Polish interface strings, written here because Fumadocs ships none.**
 *
 * Its translation keys are the English strings themselves, so an untranslated
 * key renders as English rather than as a missing-key marker — which is exactly
 * the failure the Client's own `check:i18n` exists to catch: it looks like a
 * translation nobody got round to rather than one nobody knows is missing.
 *
 * A Polish page whose table of contents says *On this page* is a page that only
 * looks translated.
 */
export const polishInterface = {
    displayName: "Polski",

    "Ask AI(AI chat button)": "Zapytaj AI",
    "Back to Home(404 page)": "Wróć na stronę główną",
    "Choose a language(language switcher)": "Wybierz język",
    "Choose a language(language switcher)(aria-label)": "Wybierz język",
    "Close Banner(banner)(aria-label)": "Zamknij baner",
    "Close Search(search dialog)(aria-label)": "Zamknij wyszukiwanie",
    "Close Sidebar(aria-label)": "Zamknij panel boczny",
    "Close Sidebar(sidebar)(aria-label)": "Zamknij panel boczny",
    "Collapse Sidebar(sidebar)(aria-label)": "Zwiń panel boczny",
    "Copied Text(code block)(aria-label)": "Skopiowano",
    "Copy Anchor Link(heading anchor)(aria-label)": "Kopiuj odnośnik do sekcji",
    "Copy Link(accordion)(aria-label)": "Kopiuj odnośnik",
    "Copy Markdown(page actions)": "Kopiuj jako Markdown",
    "Copy Text(code block)(aria-label)": "Kopiuj",
    "Dark(theme switcher)(aria-label)": "Ciemny",
    "Default(type table)": "Domyślnie",
    "Edit on GitHub(edit page)": "Edytuj na GitHubie",
    "Hide Sidebar(sidebar)": "Ukryj panel boczny",
    "Last updated on(page footer)": "Ostatnia zmiana",
    "Layout Tab(layout tab trigger)": "Układ",
    "Light(theme switcher)(aria-label)": "Jasny",
    "Next Page(pagination)": "Następna strona",
    "No Headings(table of contents)": "Brak nagłówków",
    "No results found(search dialog)": "Nic nie znaleziono",
    "On this page(table of contents)": "Na tej stronie",
    "Open Search(search trigger)(aria-label)": "Otwórz wyszukiwanie",
    "Open Sidebar(sidebar)(aria-label)": "Otwórz panel boczny",
    "Open in ChatGPT(page actions)": "Otwórz w ChatGPT",
    "Open in Claude(page actions)": "Otwórz w Claude",
    "Open in Cursor(page actions)": "Otwórz w Cursorze",
    "Open in GitHub(page actions)": "Otwórz na GitHubie",
    "Open in Scira AI(page actions)": "Otwórz w Scira AI",
    "Open(page actions)": "Otwórz",
    "Page Not Found(404 page)": "Nie ma takiej strony",
    "Parameters(type table)": "Parametry",
    "Previous Page(pagination)": "Poprzednia strona",
    "Prop(type table)": "Właściwość",
    "Read {url}, I want to ask questions about it.(page actions)":
        "Przeczytaj {url}, chcę o to zapytać.",
    "Returns(type table)": "Zwraca",
    "Search(search dialog)": "Szukaj",
    "Search(search trigger)": "Szukaj",
    "Show Sidebar(sidebar)": "Pokaż panel boczny",
    "System(theme switcher)(aria-label)": "Systemowy",
    "Table of Contents(inline table of contents)": "Spis treści",
    "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)":
        "Strona, której szukasz, mogła zostać usunięta, zmienić nazwę albo być chwilowo niedostępna.",
    "Toggle Menu(mobile menu)(aria-label)": "Przełącz menu",
    "Toggle Theme(theme switcher)(aria-label)": "Przełącz motyw",
    "Type(type table)": "Typ",
    "View as Markdown(page actions)": "Zobacz jako Markdown",
} as const;
