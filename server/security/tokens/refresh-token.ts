import { SessionId } from "@server/security/tokens/session-id";
import type { TokenClaims } from "@server/security/tokens/token-claims";

/** Opaque refresh token value object — no JWT structure. */
export class RefreshToken {
  readonly value: string;
  readonly claims: TokenClaims;
  readonly sessionId: SessionId;

  private constructor(value: string, claims: TokenClaims) {
    this.value = value;
    this.claims = claims;
    this.sessionId = SessionId.create(claims.sessionId);
    Object.freeze(this);
  }

  static create(value: string, claims: TokenClaims): RefreshToken {
    const token = value?.trim();
    if (!token) {
      throw new Error("RefreshToken requires a non-empty value.");
    }
    return new RefreshToken(token, claims);
  }

  toString(): string {
    return this.value;
  }
}
