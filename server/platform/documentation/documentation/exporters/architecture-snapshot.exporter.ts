import type { IDocumentationExporter } from "@server/platform/documentation/documentation/contracts";
import type {
  ArchitectureSnapshot,
  DocumentationBundle,
} from "@server/platform/documentation/documentation/models";

/** Exports a complete architecture snapshot. */
export class ArchitectureSnapshotExporter implements IDocumentationExporter<ArchitectureSnapshot> {
  constructor(
    private readonly validate: () => import("@server/platform/documentation/documentation/models").ValidationResult,
  ) {}

  export(documentation: DocumentationBundle): ArchitectureSnapshot {
    return Object.freeze({
      id: `architecture-snapshot-${Date.now()}`,
      capturedAt: new Date().toISOString(),
      documentation,
      validation: this.validate(),
    });
  }

  exportSnapshot(snapshot: ArchitectureSnapshot): ArchitectureSnapshot {
    return snapshot;
  }
}
