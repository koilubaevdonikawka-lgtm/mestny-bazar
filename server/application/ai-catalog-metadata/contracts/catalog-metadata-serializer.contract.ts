export interface ICatalogMetadataSerializer {
  serialize(data: unknown): Promise<string>;
  deserialize(serialized: string): Promise<unknown>;
}
