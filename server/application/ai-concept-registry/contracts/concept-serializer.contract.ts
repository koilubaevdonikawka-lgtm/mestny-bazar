import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

export interface IConceptSerializer {
  serialize(concept: Concept): Promise<string>;
  deserialize(serialized: string): Promise<Concept>;
}
