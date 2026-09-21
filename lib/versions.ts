import { readFile } from "node:fs/promises";

import { sections } from "@/lib/sections";

/** What `scripts/snapshot.mjs` writes on release day. Absent until then. */
type Versions = Record<string, { newest: string; all: string[] }>;

const VERSION = /^v\d+\.\d+$/;

let cached: Versions | null | undefined;

async function read(): Promise<Versions | null> {
    if (cached !== undefined) return cached;
    cached = await readFile("versions.json", "utf8").then(
        (text) => JSON.parse(text) as Versions,
        () => null,
    );
    return cached;
}

export interface ArchiveState {
    /** The version this page belongs to, if any. */
    version: string;
    /** The newest version of its section. */
    newest: string;
    section: string;
}

/**
 * **Whether this page is a superseded snapshot.**
 *
 * Every version is kept, because under `0.x` releases old documentation is the
 * only documentation that works for an installation that has not upgraded. That
 * is exactly why an archived page has to say so: a reader who arrives from a
 * search must not follow a procedure written for a version they are not running.
 *
 * `noindex` and the banner come from here. **`canonical` deliberately does
 * not** — an older page is not the same page under another address, and sending
 * the reader to the newest one would hand them a procedure that does not work.
 * Accepted 2026-08-09.
 */
export async function archiveState(slug: readonly string[] | undefined): Promise<ArchiveState | null> {
    if (!slug || slug.length < 2) return null;

    const [section, second] = slug;
    if (!sections.some((s) => s.slug === section)) return null;
    if (!VERSION.test(second)) return null;

    const versions = await read();
    const newest = versions?.[section]?.newest;
    if (!newest || newest === second) return null;

    return { version: second, newest, section };
}

/**
 * **A page of the newest version, which is the same text as the version-less
 * address.**
 *
 * `archiveState` answers only for a *superseded* version. This one answers for
 * the current one, and it exists because `/en/install/backup` and
 * `/en/install/v0.2/backup` are one page at two addresses: both readable, both
 * in the sitemap, each declaring itself canonical. A crawler then picks for
 * itself, which is what *Alternative page with proper canonical tag* means in
 * Search Console.
 *
 * **The version-less address is the canonical one**, because it is the one that
 * survives a release: an installation upgrades, a bookmark does not, and an
 * index rebuilt from scratch every minor release never settles.
 *
 * `unversioned` is `null` for a section root. `/en/install/` is a redirect to
 * the newest version rather than a page, so pointing `/en/install/v0.2/` at it
 * would name an address that bounces straight back.
 */
export async function newestVersion(
    slug: readonly string[] | undefined,
): Promise<{ section: string; version: string; unversioned: string[] | null } | null> {
    if (!slug || slug.length < 2) return null;

    const [section, second] = slug;
    if (!sections.some((s) => s.slug === section)) return null;
    if (!VERSION.test(second)) return null;

    const versions = await read();
    if (versions?.[section]?.newest !== second) return null;

    return {
        section,
        version: second,
        unversioned: slug.length > 2 ? [section, ...slug.slice(2)] : null,
    };
}

/** Whether this slug is a section's own root — an address nginx redirects. */
export function isSectionRoot(slug: readonly string[] | undefined): boolean {
    return slug?.length === 1 && sections.some((s) => s.slug === slug[0]);
}
