"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { staticClient } from "fumadocs-core/search/client/orama-static";
import {
    SearchDialog,
    SearchDialogClose,
    SearchDialogContent,
    SearchDialogHeader,
    SearchDialogIcon,
    SearchDialogInput,
    SearchDialogList,
    SearchDialogOverlay,
    type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useMemo } from "react";

/**
 * **The static client, because there is no server to ask.** `app/api/search/route.ts`
 * writes the index out at build time with `staticGET`; this fetches that file
 * once and searches it in the browser. The `locale` keeps a Polish reader out of
 * the English index and the other way round.
 */
export default function DocsSearchDialog(props: SharedProps) {
    const { locale } = useI18n();
    const client = useMemo(() => staticClient({ from: `/api/search/${locale}`, locale }), [locale]);
    const { search, setSearch, query } = useDocsSearch({ client });

    return (
        <SearchDialog
            search={search}
            onSearchChange={setSearch}
            isLoading={query.isLoading}
            {...props}
        >
            <SearchDialogOverlay />
            <SearchDialogContent>
                <SearchDialogHeader>
                    <SearchDialogIcon />
                    <SearchDialogInput />
                    <SearchDialogClose />
                </SearchDialogHeader>
                <SearchDialogList items={query.data !== "empty" ? query.data : null} />
            </SearchDialogContent>
        </SearchDialog>
    );
}
