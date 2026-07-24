import type { ISessionRepository } from "@server/application/authentication-management/contracts/session-repository.contract";
import type { AuthSession } from "@server/application/authentication-management/models/authentication.model";
import { createAuthSession } from "@server/application/authentication-management/models/authentication.model";

/** In-memory session store. */
export class SessionRepository implements ISessionRepository {
  private readonly sessions = new Map<string, AuthSession>();
  private readonly sessionsByAccessToken = new Map<string, string>();
  private readonly sessionsByRefreshToken = new Map<string, string>();

  async save(session: AuthSession): Promise<void> {
    this.storeSession(session);
  }

  async findById(sessionId: string): Promise<AuthSession | null> {
    return this.sessions.get(sessionId.trim()) ?? null;
  }

  async findByAccessToken(accessToken: string): Promise<AuthSession | null> {
    const sessionId = this.sessionsByAccessToken.get(accessToken.trim());
    if (!sessionId) {
      return null;
    }
    return this.findById(sessionId);
  }

  async findByRefreshToken(refreshToken: string): Promise<AuthSession | null> {
    const sessionId = this.sessionsByRefreshToken.get(refreshToken.trim());
    if (!sessionId) {
      return null;
    }
    return this.findById(sessionId);
  }

  async revoke(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (!session) {
      return;
    }

    const revokedSession = createAuthSession({
      ...session,
      revokedAt: new Date().toISOString(),
    });

    this.storeSession(revokedSession);
  }

  async update(session: AuthSession): Promise<void> {
    if (!(await this.findById(session.sessionId))) {
      throw new Error(`Session not found: ${session.sessionId}`);
    }

    this.removeTokenIndexes(session.sessionId);
    this.storeSession(session);
  }

  private storeSession(session: AuthSession): void {
    this.sessions.set(session.sessionId, session);
    this.sessionsByAccessToken.set(session.accessToken, session.sessionId);
    this.sessionsByRefreshToken.set(session.refreshToken, session.sessionId);
  }

  private removeTokenIndexes(sessionId: string): void {
    for (const [token, mappedSessionId] of this.sessionsByAccessToken.entries()) {
      if (mappedSessionId === sessionId) {
        this.sessionsByAccessToken.delete(token);
      }
    }

    for (const [token, mappedSessionId] of this.sessionsByRefreshToken.entries()) {
      if (mappedSessionId === sessionId) {
        this.sessionsByRefreshToken.delete(token);
      }
    }
  }
}
