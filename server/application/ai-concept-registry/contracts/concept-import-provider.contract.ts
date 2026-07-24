import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

/** Future integration point for concept import. Not wired yet. */
export interface IConceptImportProvider {
  importFrom(source: string): Promise<readonly Concept[]>;
}
