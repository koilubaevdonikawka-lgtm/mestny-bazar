import type { Session } from "@server/application/ai-session-management/models/session.model";

export interface ISessionRepository {
  save(session: Session): Promise<void>;
  findById(sessionId: string): Promise<Session | null>;
  findByName(name: string): Promise<Session | null>;
  findByStatus(status: string): Promise<readonly Session[]>;
  findAll(): Promise<readonly Session[]>;
  delete(sessionId: string): Promise<boolean>;
}
