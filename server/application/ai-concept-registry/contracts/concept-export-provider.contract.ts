import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

/** Future integration point for concept export. Not wired yet. */
export interface IConceptExportProvider {
  exportTo(concepts: readonly Concept[]): Promise<string>;
}
