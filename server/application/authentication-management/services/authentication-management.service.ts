/**
 * Authentication Management — identity confirmation only.
 *
 * Does not check access permissions or contain business logic.
 * Authorization Management remains a separate module.
 */
import type { IAuthenticationAuditProvider } from "@server/application/authentication-management/contracts/authentication-audit-provider.contract";
import type { IAuthenticationProvider } from "@server/application/authentication-management/contracts/authentication-provider.contract";
import type { ISessionRepository } from "@server/application/authentication-management/contracts/session-repository.contract";
import type { ITokenProvider } from "@server/application/authentication-management/contracts/token-provider.contract";
import {
  createAuthSession,
  isSessionActive,
  type AuthSession,
  type GetCurrentSessionInput,
  type LoginInput,
  type LoginResult,
  type LogoutInput,
  type LogoutResult,
  type RefreshSessionInput,
  type RefreshSessionResult,
  type RevokeSessionInput,
  type RevokeSessionResult,
  type SessionValidationResult,
  type ValidateSessionInput,
} from "@server/application/authentication-management/models/authentication.model";
import type { IIdGenerator } from "@server/application/ports";

export class AuthenticationManagementService {
  constructor(
    private readonly authenticationProvider: IAuthenticationProvider,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenProvider: ITokenProvider,
    private readonly auditProvider: IAuthenticationAuditProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const identity = await this.authenticationProvider.authenticate({
      username: input.username.trim(),
      password: input.password,
    });

    const sessionId = this.idGenerator.generate();
    const tokens = await this.tokenProvider.issueTokens(sessionId, identity.userId);
    const session = createAuthSession({
      sessionId,
      userId: identity.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      refreshExpiresAt: tokens.refreshExpiresAt,
    });

    await this.sessionRepository.save(session);
    await this.auditProvider.recordEvent({
      userId: identity.userId,
      sessionId,
      eventType: "login",
      success: true,
    });

    return Object.freeze({
      sessionId,
      userId: identity.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      refreshExpiresAt: tokens.refreshExpiresAt,
    });
  }

  async logout(input: LogoutInput): Promise<LogoutResult> {
    const session = await this.resolveSession(input);
    if (!session) {
      throw new Error("Session not found.");
    }

    await this.revokeSessionInternal(session);

    await this.auditProvider.recordEvent({
      userId: session.userId,
      sessionId: session.sessionId,
      eventType: "logout",
      success: true,
    });

    return Object.freeze({
      sessionId: session.sessionId,
      revoked: true,
    });
  }

  async refreshSession(input: RefreshSessionInput): Promise<RefreshSessionResult> {
    const session = await this.sessionRepository.findByRefreshToken(input.refreshToken.trim());
    if (!session) {
      await this.auditProvider.recordEvent({
        userId: "unknown",
        eventType: "refresh",
        success: false,
        reason: "Session not found.",
      });
      throw new Error("Invalid refresh token.");
    }

    if (session.revokedAt) {
      throw new Error("Session has been revoked.");
    }

    const refreshExpiresAt = Date.parse(session.refreshExpiresAt);
    if (Number.isNaN(refreshExpiresAt) || refreshExpiresAt <= Date.now()) {
      throw new Error("Refresh token expired.");
    }

    const tokenClaims = await this.tokenProvider.validateRefreshToken(input.refreshToken.trim());
    if (!tokenClaims || tokenClaims.sessionId !== session.sessionId) {
      throw new Error("Invalid refresh token.");
    }

    const tokens = await this.tokenProvider.refreshTokens(session.sessionId, session.userId);
    const updatedSession = createAuthSession({
      sessionId: session.sessionId,
      userId: session.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      createdAt: session.createdAt,
      expiresAt: tokens.expiresAt,
      refreshExpiresAt: tokens.refreshExpiresAt,
    });

    await this.sessionRepository.update(updatedSession);
    await this.auditProvider.recordEvent({
      userId: session.userId,
      sessionId: session.sessionId,
      eventType: "refresh",
      success: true,
    });

    return Object.freeze({
      sessionId: updatedSession.sessionId,
      userId: updatedSession.userId,
      accessToken: updatedSession.accessToken,
      refreshToken: updatedSession.refreshToken,
      expiresAt: updatedSession.expiresAt,
      refreshExpiresAt: updatedSession.refreshExpiresAt,
    });
  }

  async revokeSession(input: RevokeSessionInput): Promise<RevokeSessionResult> {
    const session = await this.sessionRepository.findById(input.sessionId.trim());
    if (!session) {
      throw new Error("Session not found.");
    }

    await this.revokeSessionInternal(session);

    await this.auditProvider.recordEvent({
      userId: session.userId,
      sessionId: session.sessionId,
      eventType: "revoke",
      success: true,
    });

    return Object.freeze({
      sessionId: session.sessionId,
      revoked: true,
    });
  }

  async getCurrentSession(input: GetCurrentSessionInput): Promise<AuthSession | null> {
    return this.resolveSession(input);
  }

  async validateSession(input: ValidateSessionInput): Promise<SessionValidationResult> {
    const session = await this.resolveSession(input);

    if (!session) {
      const result = Object.freeze({
        valid: false,
        session: null,
        reason: "Session not found.",
      });

      await this.auditProvider.recordEvent({
        userId: "unknown",
        eventType: "validate",
        success: false,
        reason: result.reason,
      });

      return result;
    }

    if (session.revokedAt) {
      const result = Object.freeze({
        valid: false,
        session,
        reason: "Session has been revoked.",
      });

      await this.auditProvider.recordEvent({
        userId: session.userId,
        sessionId: session.sessionId,
        eventType: "validate",
        success: false,
        reason: result.reason,
      });

      return result;
    }

    const tokenValid = input.accessToken
      ? (await this.tokenProvider.validateAccessToken(input.accessToken.trim())) !== null
      : true;

    if (!tokenValid) {
      const result = Object.freeze({
        valid: false,
        session,
        reason: "Access token is invalid.",
      });

      await this.auditProvider.recordEvent({
        userId: session.userId,
        sessionId: session.sessionId,
        eventType: "validate",
        success: false,
        reason: result.reason,
      });

      return result;
    }

    const active = isSessionActive(session);
    const result = Object.freeze({
      valid: active,
      session,
      reason: active ? "Session is active." : "Session has expired.",
    });

    await this.auditProvider.recordEvent({
      userId: session.userId,
      sessionId: session.sessionId,
      eventType: "validate",
      success: active,
      reason: result.reason,
    });

    return result;
  }

  private async revokeSessionInternal(session: AuthSession): Promise<void> {
    await this.sessionRepository.revoke(session.sessionId);
    await this.tokenProvider.revokeTokens(session.sessionId);
  }

  private async resolveSession(input: {
    sessionId?: string;
    accessToken?: string;
  }): Promise<AuthSession | null> {
    if (input.sessionId?.trim()) {
      return this.sessionRepository.findById(input.sessionId.trim());
    }

    if (input.accessToken?.trim()) {
      return this.sessionRepository.findByAccessToken(input.accessToken.trim());
    }

    return null;
  }
}
