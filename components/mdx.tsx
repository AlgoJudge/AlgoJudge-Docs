import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { OpenAPIPage } from "@/components/api-page";
import { Mermaid } from "@/components/mermaid";

export function getMDXComponents(components?: MDXComponents) {
    return {
        ...defaultMdxComponents,
        // The generated REST pages ask for this by name. `APIPage` is the name
        // it had before fumadocs-openapi v11 and the generated file accepts
        // either, so only the current one is registered.
        OpenAPIPage,
        // Registered here rather than imported per page, because a diagram is
        // prose furniture: a page that draws one should read like a page that
        // does not.
        Mermaid,
        ...components,
    } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;
