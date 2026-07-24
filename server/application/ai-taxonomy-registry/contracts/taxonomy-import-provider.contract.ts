import type { Taxonomy } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

/** Future integration point for taxonomy import. Not wired yet. */
export interface ITaxonomyImportProvider {
  importFrom(source: string): Promise<readonly Taxonomy[]>;
}
