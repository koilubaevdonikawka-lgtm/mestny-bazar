export interface IMemorySerializer {
  serialize(data: unknown): Promise<string>;
  deserialize(serialized: string): Promise<unknown>;
}
