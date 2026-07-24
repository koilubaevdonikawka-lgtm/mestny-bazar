import type { Ontology } from "@server/application/ai-ontology-registry/models/ontology.model";

/** Future integration point for ontology import. Not wired yet. */
export interface IOntologyImportProvider {
  importFrom(source: string): Promise<readonly Ontology[]>;
}
