import type { Ontology } from "@server/application/ai-ontology-registry/models/ontology.model";

/** Future integration point for ontology synchronization. Not wired yet. */
export interface IOntologySynchronizationProvider {
  synchronize(ontologies: readonly Ontology[]): Promise<void>;
}
