import type { DocumentationBundle } from "@server/platform/documentation/documentation/models";

/** Contract for documentation generation. */
export interface IDocumentationGenerator {
  generate(): DocumentationBundle;
}
