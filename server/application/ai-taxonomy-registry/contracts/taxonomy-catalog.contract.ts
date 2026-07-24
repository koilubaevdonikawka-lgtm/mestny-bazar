import type { Taxonomy } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

export interface ITaxonomyCatalog {
  register(taxonomy: Taxonomy): Promise<void>;
  remove(taxonomyId: string): Promise<void>;
  findById(taxonomyId: string): Promise<Taxonomy | null>;
  findByName(name: string): Promise<Taxonomy | null>;
  findByCategory(category: string): Promise<readonly Taxonomy[]>;
  listAll(): Promise<readonly Taxonomy[]>;
}
