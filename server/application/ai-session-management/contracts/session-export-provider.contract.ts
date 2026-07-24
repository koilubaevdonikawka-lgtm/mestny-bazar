import type { Session } from "@server/application/ai-session-management/models/session.model";

/** Future integration point for session export. Not wired yet. */
export interface ISessionExportProvider {
  exportSession(session: Session): Promise<string>;
  exportAll(sessions: readonly Session[]): Promise<string>;
}
