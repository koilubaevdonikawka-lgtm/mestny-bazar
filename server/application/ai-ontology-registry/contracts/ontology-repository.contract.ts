import type { Ontology } from "@server/application/ai-ontology-registry/models/ontology.model";

export interface IOntologyRepository {
  save(ontology: Ontology): Promise<void>;
  findById(ontologyId: string): Promise<Ontology | null>;
  findByName(name: string): Promise<Ontology | null>;
  findByCategory(category: string): Promise<readonly Ontology[]>;
  findAll(): Promise<readonly Ontology[]>;
  delete(ontologyId: string): Promise<boolean>;
}
