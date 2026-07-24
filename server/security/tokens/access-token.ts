import { SessionId } from "@server/security/tokens/session-id";
import type { TokenClaims } from "@server/security/tokens/token-claims";

/** Opaque access token value object — no JWT structure. */
export class AccessToken {
  readonly value: string;
  readonly claims: TokenClaims;
  readonly sessionId: SessionId;

  private constructor(value: string, claims: TokenClaims) {
    this.value = value;
    this.claims = claims;
    this.sessionId = SessionId.create(claims.sessionId);
    Object.freeze(this);
  }

  static create(value: string, claims: TokenClaims): AccessToken {
    const token = value?.trim();
    if (!token) {
      throw new Error("AccessToken requires a non-empty value.");
    }
    return new AccessToken(token, claims);
  }

  toString(): string {
    return this.value;
  }
}
