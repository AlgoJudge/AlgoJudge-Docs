import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { OpenAPIPage } from "@/components/api-page";

export function getMDXComponents(components?: MDXComponents) {
    return {
        ...defaultMdxComponents,
        // The generated REST pages ask for this by name. `APIPage` is the name
        // it had before fumadocs-openapi v11 and the generated file accepts
        // either, so only the current one is registered.
        OpenAPIPage,
        ...components,
    } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;
