import type { AuthSession } from "@server/application/authentication-management/models/authentication.model";

export interface ISessionRepository {
  save(session: AuthSession): Promise<void>;
  findById(sessionId: string): Promise<AuthSession | null>;
  findByAccessToken(accessToken: string): Promise<AuthSession | null>;
  findByRefreshToken(refreshToken: string): Promise<AuthSession | null>;
  revoke(sessionId: string): Promise<void>;
  update(session: AuthSession): Promise<void>;
}
