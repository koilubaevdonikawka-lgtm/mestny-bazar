import type { Session } from "@server/application/ai-session-management/models/session.model";

/** Future integration point for external session providers. Not wired yet. */
export interface IRemoteSessionProvider {
  fetchRemote(sessionId: string): Promise<Session | null>;
  pushRemote(session: Session): Promise<void>;
}
