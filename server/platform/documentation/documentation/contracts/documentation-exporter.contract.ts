import type {
  ArchitectureSnapshot,
  DocumentationBundle,
} from "@server/platform/documentation/documentation/models";

/** Contract for documentation exporters. */
export interface IDocumentationExporter<TOutput> {
  export(documentation: DocumentationBundle): TOutput;
  exportSnapshot?(snapshot: ArchitectureSnapshot): TOutput;
}
