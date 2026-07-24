/** Active authentication session — identity confirmation only, no authorization data. */
export interface AuthSession {
  readonly sessionId: string;
  readonly userId: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly refreshExpiresAt: string;
  readonly revokedAt: string | null;
}

export interface LoginInput {
  readonly username: string;
  readonly password: string;
}

export interface LoginResult {
  readonly sessionId: string;
  readonly userId: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: string;
  readonly refreshExpiresAt: string;
}

export interface LogoutInput {
  readonly sessionId?: string;
  readonly accessToken?: string;
}

export interface LogoutResult {
  readonly sessionId: string;
  readonly revoked: boolean;
}

export interface RefreshSessionInput {
  readonly refreshToken: string;
}

export interface RefreshSessionResult {
  readonly sessionId: string;
  readonly userId: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: string;
  readonly refreshExpiresAt: string;
}

export interface RevokeSessionInput {
  readonly sessionId: string;
}

export interface RevokeSessionResult {
  readonly sessionId: string;
  readonly revoked: boolean;
}

export interface GetCurrentSessionInput {
  readonly sessionId?: string;
  readonly accessToken?: string;
}

export interface ValidateSessionInput {
  readonly sessionId?: string;
  readonly accessToken?: string;
}

export interface SessionValidationResult {
  readonly valid: boolean;
  readonly session: AuthSession | null;
  readonly reason: string;
}

export function createAuthSession(input: {
  sessionId: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  createdAt?: string;
  expiresAt: string;
  refreshExpiresAt: string;
  revokedAt?: string | null;
}): AuthSession {
  return Object.freeze({
    sessionId: input.sessionId.trim(),
    userId: input.userId.trim(),
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    createdAt: input.createdAt ?? new Date().toISOString(),
    expiresAt: input.expiresAt,
    refreshExpiresAt: input.refreshExpiresAt,
    revokedAt: input.revokedAt ?? null,
  });
}

export function isSessionActive(session: AuthSession, now = Date.now()): boolean {
  if (session.revokedAt) {
    return false;
  }

  const expiresAt = Date.parse(session.expiresAt);
  return !Number.isNaN(expiresAt) && expiresAt > now;
}
