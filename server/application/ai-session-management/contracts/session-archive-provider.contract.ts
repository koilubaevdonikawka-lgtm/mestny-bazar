import type { Session } from "@server/application/ai-session-management/models/session.model";

/** Future integration point for session archiving. Not wired yet. */
export interface ISessionArchiveProvider {
  archive(session: Session): Promise<{ archiveId: string }>;
  listArchived(sessionId: string): Promise<readonly Session[]>;
}
