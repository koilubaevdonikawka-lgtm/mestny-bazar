export interface ICacheSerializer {
  serialize(value: unknown): string;
  deserialize(payload: string): unknown;
}
