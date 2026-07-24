import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

/** Future integration point for concept synchronization. Not wired yet. */
export interface IConceptSynchronizationProvider {
  synchronize(concepts: readonly Concept[]): Promise<void>;
}
