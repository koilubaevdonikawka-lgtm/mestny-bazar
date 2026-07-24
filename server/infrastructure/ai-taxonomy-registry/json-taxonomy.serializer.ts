import type { ITaxonomySerializer } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-serializer.contract";
import {
  createTaxonomy,
  type Taxonomy,
} from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

/** JSON-based taxonomy serializer. */
export class JsonTaxonomySerializer implements ITaxonomySerializer {
  async serialize(taxonomy: Taxonomy): Promise<string> {
    return JSON.stringify(taxonomy);
  }

  async deserialize(serialized: string): Promise<Taxonomy> {
    if (!serialized.trim()) {
      throw new Error("Serialized taxonomy cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Taxonomy>;
    return createTaxonomy({
      taxonomyId: parsed.taxonomyId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
