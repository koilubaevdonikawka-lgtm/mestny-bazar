import type { IdentityType } from "@server/security/shared";

/** Immutable base identity — provider-agnostic security principal. */
export abstract class Identity {
  abstract readonly type: IdentityType;

  protected constructor() {}

  equals(other: Identity): boolean {
    return this.type === other.type && this.identityKey() === other.identityKey();
  }

  /** Stable comparison key for equality checks. */
  protected abstract identityKey(): string;
}
