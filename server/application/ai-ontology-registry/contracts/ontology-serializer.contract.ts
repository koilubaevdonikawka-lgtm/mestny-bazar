import type { Ontology } from "@server/application/ai-ontology-registry/models/ontology.model";

export interface IOntologySerializer {
  serialize(ontology: Ontology): Promise<string>;
  deserialize(serialized: string): Promise<Ontology>;
}
