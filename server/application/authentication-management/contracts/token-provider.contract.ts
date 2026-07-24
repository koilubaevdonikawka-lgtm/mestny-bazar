export interface IssuedTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: string;
  readonly refreshExpiresAt: string;
}

export interface ITokenProvider {
  issueTokens(sessionId: string, userId: string): Promise<IssuedTokens>;
  refreshTokens(sessionId: string, userId: string): Promise<IssuedTokens>;
  validateAccessToken(accessToken: string): Promise<{ sessionId: string; userId: string } | null>;
  validateRefreshToken(refreshToken: string): Promise<{ sessionId: string; userId: string } | null>;
  revokeTokens(sessionId: string): Promise<void>;
}
