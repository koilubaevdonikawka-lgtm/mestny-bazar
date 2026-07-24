import { Identity } from "@server/security/identity/identity.base";

export interface AuthenticatedIdentityProps {
  userId: string;
  displayName?: string;
  email?: string;
}

/** Represents an authenticated human or service account user. */
export class AuthenticatedIdentity extends Identity {
  readonly type = "authenticated" as const;
  readonly userId: string;
  readonly displayName?: string;
  readonly email?: string;

  private constructor(props: AuthenticatedIdentityProps) {
    super();
    this.userId = props.userId;
    this.displayName = props.displayName;
    this.email = props.email;
    Object.freeze(this);
  }

  static create(props: AuthenticatedIdentityProps): AuthenticatedIdentity {
    const userId = props.userId?.trim();
    if (!userId) {
      throw new Error("AuthenticatedIdentity requires a non-empty userId.");
    }

    return new AuthenticatedIdentity({
      userId,
      displayName: props.displayName?.trim() || undefined,
      email: props.email?.trim() || undefined,
    });
  }

  protected identityKey(): string {
    return `authenticated:${this.userId}`;
  }
}
