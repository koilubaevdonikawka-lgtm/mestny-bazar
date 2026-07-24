import type { Ontology } from "@server/application/ai-ontology-registry/models/ontology.model";

export interface IOntologyCatalog {
  register(ontology: Ontology): Promise<void>;
  remove(ontologyId: string): Promise<void>;
  findById(ontologyId: string): Promise<Ontology | null>;
  findByName(name: string): Promise<Ontology | null>;
  findByCategory(category: string): Promise<readonly Ontology[]>;
  listAll(): Promise<readonly Ontology[]>;
}
