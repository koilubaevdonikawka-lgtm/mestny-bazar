import type { Session } from "@server/application/ai-session-management/models/session.model";

export interface ISessionCatalog {
  register(session: Session): Promise<void>;
  remove(sessionId: string): Promise<void>;
  findById(sessionId: string): Promise<Session | null>;
  findByName(name: string): Promise<Session | null>;
  findByStatus(status: string): Promise<readonly Session[]>;
  listAll(): Promise<readonly Session[]>;
}
