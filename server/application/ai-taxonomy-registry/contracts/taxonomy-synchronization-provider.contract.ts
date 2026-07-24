import type { Taxonomy } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

/** Future integration point for taxonomy synchronization. Not wired yet. */
export interface ITaxonomySynchronizationProvider {
  synchronize(taxonomies: readonly Taxonomy[]): Promise<void>;
}
