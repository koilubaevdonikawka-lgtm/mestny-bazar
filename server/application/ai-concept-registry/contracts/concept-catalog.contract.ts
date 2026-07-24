import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

export interface IConceptCatalog {
  register(concept: Concept): Promise<void>;
  remove(conceptId: string): Promise<void>;
  findById(conceptId: string): Promise<Concept | null>;
  findByName(name: string): Promise<Concept | null>;
  findByCategory(category: string): Promise<readonly Concept[]>;
  listAll(): Promise<readonly Concept[]>;
}
