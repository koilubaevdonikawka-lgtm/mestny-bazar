import type { ICatalogMetadataSerializer } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-serializer.contract";

/** JSON-based catalog metadata serializer. */
export class JsonCatalogMetadataSerializer implements ICatalogMetadataSerializer {
  async serialize(data: unknown): Promise<string> {
    return JSON.stringify(data ?? {});
  }

  async deserialize(serialized: string): Promise<unknown> {
    if (!serialized.trim()) {
      return Object.freeze({});
    }
    return JSON.parse(serialized) as unknown;
  }
}
