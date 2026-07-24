import type { Taxonomy } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

export interface ITaxonomySerializer {
  serialize(taxonomy: Taxonomy): Promise<string>;
  deserialize(serialized: string): Promise<Taxonomy>;
}
