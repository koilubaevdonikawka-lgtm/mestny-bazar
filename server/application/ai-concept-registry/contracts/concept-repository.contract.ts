import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

export interface IConceptRepository {
  save(concept: Concept): Promise<void>;
  findById(conceptId: string): Promise<Concept | null>;
  findByName(name: string): Promise<Concept | null>;
  findByCategory(category: string): Promise<readonly Concept[]>;
  findAll(): Promise<readonly Concept[]>;
  delete(conceptId: string): Promise<boolean>;
}
