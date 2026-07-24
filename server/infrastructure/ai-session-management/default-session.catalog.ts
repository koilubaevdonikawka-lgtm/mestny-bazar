import type { ISessionCatalog } from "@server/application/ai-session-management/contracts/session-catalog.contract";
import type { Session } from "@server/application/ai-session-management/models/session.model";

/** Default in-memory session catalog index. */
export class DefaultSessionCatalog implements ISessionCatalog {
  private readonly sessions = new Map<string, Session>();
  private readonly sessionsByName = new Map<string, string>();
  private readonly sessionsByStatus = new Map<string, Set<string>>();

  async register(session: Session): Promise<void> {
    const existing = this.sessions.get(session.sessionId);
    if (existing) {
      if (existing.name !== session.name) {
        this.sessionsByName.delete(existing.name);
      }
      if (existing.status !== session.status) {
        this.removeFromStatus(existing.status, existing.sessionId);
      }
    }

    this.sessions.set(session.sessionId, session);
    this.sessionsByName.set(session.name, session.sessionId);
    this.addToStatus(session.status, session.sessionId);
  }

  async remove(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId.trim());
    if (!session) {
      return;
    }
    this.sessions.delete(session.sessionId);
    this.sessionsByName.delete(session.name);
    this.removeFromStatus(session.status, session.sessionId);
  }

  async findById(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Session | null> {
    const sessionId = this.sessionsByName.get(name.trim());
    if (!sessionId) {
      return null;
    }
    return this.sessions.get(sessionId) ?? null;
  }

  async findByStatus(status: string): Promise<readonly Session[]> {
    const sessionIds = this.sessionsByStatus.get(status.trim());
    if (!sessionIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...sessionIds]
        .map((sessionId) => this.sessions.get(sessionId))
        .filter((session): session is Session => session !== undefined),
    );
  }

  async listAll(): Promise<readonly Session[]> {
    return Object.freeze([...this.sessions.values()]);
  }

  private addToStatus(status: string, sessionId: string): void {
    const normalizedStatus = status.trim();
    const statusSet = this.sessionsByStatus.get(normalizedStatus) ?? new Set<string>();
    statusSet.add(sessionId);
    this.sessionsByStatus.set(normalizedStatus, statusSet);
  }

  private removeFromStatus(status: string, sessionId: string): void {
    const normalizedStatus = status.trim();
    const statusSet = this.sessionsByStatus.get(normalizedStatus);
    if (!statusSet) {
      return;
    }
    statusSet.delete(sessionId);
    if (statusSet.size === 0) {
      this.sessionsByStatus.delete(normalizedStatus);
    }
  }
}
