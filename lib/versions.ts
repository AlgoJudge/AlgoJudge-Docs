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
