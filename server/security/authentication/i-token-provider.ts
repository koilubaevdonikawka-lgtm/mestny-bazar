import type { TokenClaims } from "@server/security/tokens/token-claims";
import type { AccessToken } from "@server/security/tokens/access-token";
import type { RefreshToken } from "@server/security/tokens/refresh-token";
import type { SessionId } from "@server/security/tokens/session-id";

/** Issues and validates opaque domain tokens — no JWT coupling. */
export interface ITokenProvider {
  issueAccessToken(claims: TokenClaims, sessionId: SessionId): Promise<AccessToken>;
  issueRefreshToken(claims: TokenClaims, sessionId: SessionId): Promise<RefreshToken>;
  validateAccessToken(token: AccessToken): Promise<TokenClaims>;
  validateRefreshToken(token: RefreshToken): Promise<TokenClaims>;
  revokeSession(sessionId: SessionId): Promise<void>;
}
