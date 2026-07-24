import type { IDocumentationExporter } from "@server/platform/documentation/documentation/contracts";
import type {
  ArchitectureSnapshot,
  DocumentationBundle,
} from "@server/platform/documentation/documentation/models";

/** Exports documentation as JSON-serializable objects. */
export class JsonExporter implements IDocumentationExporter<Record<string, unknown>> {
  export(documentation: DocumentationBundle): Record<string, unknown> {
    return Object.freeze(structuredClone(documentation) as Record<string, unknown>);
  }

  exportSnapshot(snapshot: ArchitectureSnapshot): Record<string, unknown> {
    return Object.freeze(structuredClone(snapshot) as Record<string, unknown>);
  }
}
