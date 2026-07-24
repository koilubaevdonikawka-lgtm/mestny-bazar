/** Shared contract for immutable domain value objects. */
export interface ValueObject<TSelf, TJson> {
  equals(other: TSelf): boolean;
  toJSON(): TJson;
  clone(): TSelf;
}
