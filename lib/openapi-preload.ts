import { openapi } from "@/lib/openapi";

type LoadedSchema = Awaited<ReturnType<typeof openapi.getSchema>>;
type Document = LoadedSchema["bundled"];

export type PreloadedSchemas = { docs: Record<string, Document> };
export type OperationRef = { path: string; method: string };

/**
 * A generated REST page names its schema rather than carrying it: the file says
 * `document=".sources/openapi.json"` and declares the same name under
 * `_openapi.preload` in its front matter. Something has to turn that name into
 * the parsed document, and `openapiPlugin()` is not it — that one only decorates
 * the page tree with the method labels.
 *
 * So the page loads it here, on the server. Loading is cached inside
 * `createOpenAPI`, so the tag pages read one file once between them.
 */
export async function loadSchemas(data: unknown): Promise<Record<string, Document> | undefined> {
    const names = (data as { _openapi?: { preload?: unknown } })._openapi?.preload;
    if (!Array.isArray(names) || names.length === 0) return undefined;

    const entries = await Promise.all(
        names
            .filter((name): name is string => typeof name === "string")
            .map(async (name) => [name, (await openapi.getSchema(name)).bundled] as const),
    );

    return Object.fromEntries(entries);
}

/** `#/components/<group>/<name>` — the only reference form this document uses. */
const COMPONENT_REF = /^#\/components\/([^/]+)\/(.+)$/;

/**
 * **One tag's worth of document, not the whole API.**
 *
 * The page component is a client component, so whatever it is handed is
 * serialised into the page. Handing it the bundled document put all 160 paths
 * and all 196 schemas into every one of the 90 REST pages: 210 kB serialised per
 * page, a 456 kB HTML file for a tag with eight paths, and a 166 MB export. A
 * reader opening *Account* downloaded the whole API surface.
 *
 * Narrowing the paths is the easy half. The other half is that a path is useless
 * without the schemas it references, and those reference each other — so the
 * kept set is the **transitive closure** of `$ref` from the operations this page
 * actually renders, not a first-level copy.
 */
export function narrow(document: Document, operations: readonly OperationRef[]): Document {
    const source = document as unknown as {
        paths?: Record<string, Record<string, unknown>>;
        components?: Record<string, Record<string, unknown>>;
    };

    const paths: Record<string, Record<string, unknown>> = {};
    for (const { path, method } of operations) {
        const item = source.paths?.[path];
        if (!item) continue;

        const kept = (paths[path] ??= {});
        // A path-level `parameters` applies to every method on it, so it travels
        // with any one of them.
        if (item.parameters !== undefined) kept.parameters = item.parameters;
        const operation = item[method.toLowerCase()] ?? item[method];
        if (operation !== undefined) kept[method.toLowerCase()] = operation;
    }

    const reached = new Set<string>();
    const visit = (node: unknown): void => {
        if (node === null || typeof node !== "object") return;
        if (Array.isArray(node)) {
            for (const item of node) visit(item);
            return;
        }
        for (const [key, value] of Object.entries(node)) {
            if (key === "$ref" && typeof value === "string") {
                const match = COMPONENT_REF.exec(value);
                if (!match) continue;
                const id = `${match[1]}/${match[2]}`;
                if (reached.has(id)) continue;
                reached.add(id);
                visit(source.components?.[match[1]]?.[match[2]]);
                continue;
            }
            visit(value);
        }
    };
    visit(paths);

    const components: Record<string, Record<string, unknown>> = {};
    for (const id of reached) {
        const cut = id.indexOf("/");
        const group = id.slice(0, cut);
        const name = id.slice(cut + 1);
        const value = source.components?.[group]?.[name];
        if (value === undefined) continue;
        (components[group] ??= {})[name] = value;
    }

    // Kept whole however few operations survive: the page's own security notes
    // are drawn from it, and it is small.
    if (source.components?.securitySchemes) {
        components.securitySchemes = source.components.securitySchemes;
    }

    return { ...(document as object), paths, components } as Document;
}
