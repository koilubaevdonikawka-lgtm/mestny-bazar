import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

/** Future integration point for external concept providers. Not wired yet. */
export interface IRemoteConceptProvider {
  fetchRemote(conceptId: string): Promise<Concept | null>;
  pushRemote(concept: Concept): Promise<void>;
}
