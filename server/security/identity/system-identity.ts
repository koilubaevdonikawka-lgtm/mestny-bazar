import { Identity } from "@server/security/identity/identity.base";

/** Represents an internal platform/system actor. */
export class SystemIdentity extends Identity {
  readonly type = "system" as const;
  readonly systemName: string;

  private static readonly defaultInstance = Object.freeze(new SystemIdentity("platform"));

  private constructor(systemName: string) {
    super();
    this.systemName = systemName;
    Object.freeze(this);
  }

  static platform(): SystemIdentity {
    return SystemIdentity.defaultInstance;
  }

  static create(systemName: string): SystemIdentity {
    const name = systemName?.trim();
    if (!name) {
      throw new Error("SystemIdentity requires a non-empty systemName.");
    }

    if (name === "platform") {
      return SystemIdentity.platform();
    }

    return new SystemIdentity(name);
  }

  protected identityKey(): string {
    return `system:${this.systemName}`;
  }
}
