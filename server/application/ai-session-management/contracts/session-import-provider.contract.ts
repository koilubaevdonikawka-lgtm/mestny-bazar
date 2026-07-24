import type { Session } from "@server/application/ai-session-management/models/session.model";

/** Future integration point for session import. Not wired yet. */
export interface ISessionImportProvider {
  importFromSource(source: string): Promise<readonly Session[]>;
}
