export interface IKnowledgeSerializer {
  serialize(data: unknown): Promise<string>;
  deserialize(serialized: string): Promise<unknown>;
}
