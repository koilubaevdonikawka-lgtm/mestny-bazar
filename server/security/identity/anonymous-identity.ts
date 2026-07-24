import { Identity } from "@server/security/identity/identity.base";

/** Represents an unauthenticated caller (guest). */
export class AnonymousIdentity extends Identity {
  readonly type = "anonymous" as const;

  private static readonly singleton = Object.freeze(new AnonymousIdentity());

  private constructor() {
    super();
  }

  static create(): AnonymousIdentity {
    return AnonymousIdentity.singleton;
  }

  protected identityKey(): string {
    return "anonymous";
  }
}
