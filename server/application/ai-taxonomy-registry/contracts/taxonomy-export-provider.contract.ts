import type { Taxonomy } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

/** Future integration point for taxonomy export. Not wired yet. */
export interface ITaxonomyExportProvider {
  exportTo(taxonomies: readonly Taxonomy[]): Promise<string>;
}
