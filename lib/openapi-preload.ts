import { openapi } from "@/lib/openapi";

type LoadedSchema = Awaited<ReturnType<typeof openapi.getSchema>>;
export type PreloadedSchemas = { docs: Record<string, LoadedSchema["bundled"]> };

/**
 * A generated REST page names its schema rather than carrying it: the file says
 * `document=".sources/openapi.json"` and declares the same name under
 * `_openapi.preload` in its front matter. Something has to turn that name into
 * the parsed document, and `openapiPlugin()` is not it — that one only decorates
 * the page tree with the method labels.
 *
 * So the page loads it here, on the server, and hands the client component a
 * plain object. Loading is cached inside `createOpenAPI`, so the tag pages read
 * one file once between them.
 */
export async function preloadedSchemas(data: unknown): Promise<PreloadedSchemas | undefined> {
    const names = (data as { _openapi?: { preload?: unknown } })._openapi?.preload;
    if (!Array.isArray(names) || names.length === 0) return undefined;

    const entries = await Promise.all(
        names
            .filter((name): name is string => typeof name === "string")
            .map(async (name) => [name, (await openapi.getSchema(name)).bundled] as const),
    );

    return { docs: Object.fromEntries(entries) };
}
