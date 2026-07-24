import type { Taxonomy } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

/** Future integration point for external taxonomy providers. Not wired yet. */
export interface IRemoteTaxonomyProvider {
  fetchRemote(taxonomyId: string): Promise<Taxonomy | null>;
  pushRemote(taxonomy: Taxonomy): Promise<void>;
}
