import type {
  IssuedTokens,
  ITokenProvider,
} from "@server/application/authentication-management/contracts/token-provider.contract";
import { randomBytes } from "node:crypto";

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface TokenRecord {
  readonly sessionId: string;
  readonly userId: string;
  readonly type: "access" | "refresh";
  readonly expiresAt: string;
}

/** Opaque token provider — no JWT, no external token services. */
export class OpaqueTokenProvider implements ITokenProvider {
  private readonly tokens = new Map<string, TokenRecord>();
  private readonly revokedSessions = new Set<string>();

  async issueTokens(sessionId: string, userId: string): Promise<IssuedTokens> {
    const accessToken = this.createToken("access");
    const refreshToken = this.createToken("refresh");
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString();
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString();

    this.tokens.set(accessToken, {
      sessionId,
      userId,
      type: "access",
      expiresAt,
    });
    this.tokens.set(refreshToken, {
      sessionId,
      userId,
      type: "refresh",
      expiresAt: refreshExpiresAt,
    });

    return Object.freeze({
      accessToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
    });
  }

  async refreshTokens(sessionId: string, userId: string): Promise<IssuedTokens> {
    this.removeSessionTokens(sessionId);
    return this.issueTokens(sessionId, userId);
  }

  async validateAccessToken(accessToken: string): Promise<{ sessionId: string; userId: string } | null> {
    return this.validateToken(accessToken, "access");
  }

  async validateRefreshToken(refreshToken: string): Promise<{ sessionId: string; userId: string } | null> {
    return this.validateToken(refreshToken, "refresh");
  }

  async revokeTokens(sessionId: string): Promise<void> {
    this.revokedSessions.add(sessionId);
    this.removeSessionTokens(sessionId);
  }

  private validateToken(
    token: string,
    expectedType: "access" | "refresh",
  ): { sessionId: string; userId: string } | null {
    const record = this.tokens.get(token.trim());
    if (!record || record.type !== expectedType) {
      return null;
    }

    if (this.revokedSessions.has(record.sessionId)) {
      return null;
    }

    const expiresAt = Date.parse(record.expiresAt);
    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      this.tokens.delete(token.trim());
      return null;
    }

    return Object.freeze({
      sessionId: record.sessionId,
      userId: record.userId,
    });
  }

  private removeSessionTokens(sessionId: string): void {
    for (const [token, record] of this.tokens.entries()) {
      if (record.sessionId === sessionId) {
        this.tokens.delete(token);
      }
    }
  }

  private createToken(type: "access" | "refresh"): string {
    return `${type}_${randomBytes(24).toString("base64url")}`;
  }
}
