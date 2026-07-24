import type { Taxonomy } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

export interface ITaxonomyRepository {
  save(taxonomy: Taxonomy): Promise<void>;
  findById(taxonomyId: string): Promise<Taxonomy | null>;
  findByName(name: string): Promise<Taxonomy | null>;
  findByCategory(category: string): Promise<readonly Taxonomy[]>;
  findAll(): Promise<readonly Taxonomy[]>;
  delete(taxonomyId: string): Promise<boolean>;
}
