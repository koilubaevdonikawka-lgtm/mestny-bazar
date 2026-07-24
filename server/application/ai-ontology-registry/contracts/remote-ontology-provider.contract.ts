import type { Ontology } from "@server/application/ai-ontology-registry/models/ontology.model";

/** Future integration point for external ontology providers. Not wired yet. */
export interface IRemoteOntologyProvider {
  fetchRemote(ontologyId: string): Promise<Ontology | null>;
  pushRemote(ontology: Ontology): Promise<void>;
}
