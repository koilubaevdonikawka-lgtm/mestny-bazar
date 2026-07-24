import type { RoleName } from "@server/security/roles";
import type { Permission } from "@server/security/permissions";

/** Claims carried by access and refresh tokens — provider-agnostic. */
export interface TokenClaims {
  readonly subjectId: string;
  readonly sessionId: string;
  readonly roles: readonly RoleName[];
  readonly permissions: readonly Permission[];
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly tenantId?: string;
  readonly scopes?: readonly string[];
}

/** Creates immutable token claims with validation. */
export function createTokenClaims(input: TokenClaims): TokenClaims {
  const subjectId = input.subjectId?.trim();
  const sessionId = input.sessionId?.trim();

  if (!subjectId || !sessionId) {
    throw new Error("TokenClaims require subjectId and sessionId.");
  }

  if (!input.issuedAt || !input.expiresAt) {
    throw new Error("TokenClaims require issuedAt and expiresAt.");
  }

  return Object.freeze({
    subjectId,
    sessionId,
    roles: Object.freeze([...input.roles]),
    permissions: Object.freeze([...input.permissions]),
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    tenantId: input.tenantId?.trim() || undefined,
    scopes: input.scopes ? Object.freeze([...input.scopes]) : undefined,
  });
}

/** Returns true when claims are past their expiration timestamp. */
export function isTokenClaimsExpired(claims: TokenClaims, now: Date = new Date()): boolean {
  return now.getTime() >= Date.parse(claims.expiresAt);
}
