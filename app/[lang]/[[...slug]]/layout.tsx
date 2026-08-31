import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

import { HomepageLink } from "@/components/homepage-link";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default async function Layout({
    params,
    children,
}: {
    params: Promise<{ lang: string }>;
    children: ReactNode;
}) {
    const { lang } = await params;

    return (
        <DocsLayout
            tree={source.getPageTree(lang)}
            sidebar={{ footer: <HomepageLink locale={lang} /> }}
            {...baseOptions(lang)}
        >
            {children}
        </DocsLayout>
    );
}
