import type { Ontology } from "@server/application/ai-ontology-registry/models/ontology.model";

/** Future integration point for ontology export. Not wired yet. */
export interface IOntologyExportProvider {
  exportTo(ontologies: readonly Ontology[]): Promise<string>;
}
