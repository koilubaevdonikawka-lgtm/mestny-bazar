/** Shared contract for immutable order value objects. */
export interface ValueObject<TSelf, TJson> {
  equals(other: TSelf): boolean;
  toJSON(): TJson;
  clone(): TSelf;
}
