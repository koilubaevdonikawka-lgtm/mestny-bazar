export interface IIdempotencySerializer {
  serialize(value: unknown): string;
  deserialize<T = unknown>(payload: string): T;
}
