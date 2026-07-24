import type { Session } from "@server/application/ai-session-management/models/session.model";

/** Future integration point for external session storage. Not wired yet. */
export interface ISessionStorageProvider {
  store(session: Session): Promise<void>;
  retrieve(sessionId: string): Promise<Session | null>;
}
