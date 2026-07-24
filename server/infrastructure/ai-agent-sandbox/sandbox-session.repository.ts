import type { ISandboxSessionRepository } from "@server/application/ai-agent-sandbox/contracts/sandbox-session-repository.contract";
import type { SandboxSession } from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** In-memory sandbox session store. */
export class SandboxSessionRepository implements ISandboxSessionRepository {
  private readonly sessions = new Map<string, SandboxSession>();
  private readonly sessionsBySandboxId = new Map<string, Set<string>>();

  async save(session: SandboxSession): Promise<void> {
    const existing = this.sessions.get(session.sessionId);
    if (existing && existing.sandboxId !== session.sandboxId) {
      this.removeFromSandbox(existing.sandboxId, existing.sessionId);
    }

    this.sessions.set(session.sessionId, session);
    this.addToSandbox(session.sandboxId, session.sessionId);
  }

  async findById(sessionId: string): Promise<SandboxSession | null> {
    return this.sessions.get(sessionId.trim()) ?? null;
  }

  async findBySandboxId(sandboxId: string): Promise<readonly SandboxSession[]> {
    const sessionIds = this.sessionsBySandboxId.get(sandboxId.trim());
    if (!sessionIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...sessionIds]
        .map((sessionId) => this.sessions.get(sessionId))
        .filter((session): session is SandboxSession => session !== undefined),
    );
  }

  async findAll(): Promise<readonly SandboxSession[]> {
    return Object.freeze([...this.sessions.values()]);
  }

  async delete(sessionId: string): Promise<boolean> {
    const session = await this.findById(sessionId);
    if (!session) {
      return false;
    }
    this.sessions.delete(session.sessionId);
    this.removeFromSandbox(session.sandboxId, session.sessionId);
    return true;
  }

  async deleteBySandboxId(sandboxId: string): Promise<number> {
    const sessions = await this.findBySandboxId(sandboxId);
    for (const session of sessions) {
      this.sessions.delete(session.sessionId);
    }
    this.sessionsBySandboxId.delete(sandboxId.trim());
    return sessions.length;
  }

  private addToSandbox(sandboxId: string, sessionId: string): void {
    const normalizedSandboxId = sandboxId.trim();
    const sandboxSet = this.sessionsBySandboxId.get(normalizedSandboxId) ?? new Set<string>();
    sandboxSet.add(sessionId);
    this.sessionsBySandboxId.set(normalizedSandboxId, sandboxSet);
  }

  private removeFromSandbox(sandboxId: string, sessionId: string): void {
    const normalizedSandboxId = sandboxId.trim();
    const sandboxSet = this.sessionsBySandboxId.get(normalizedSandboxId);
    if (!sandboxSet) {
      return;
    }
    sandboxSet.delete(sessionId);
    if (sandboxSet.size === 0) {
      this.sessionsBySandboxId.delete(normalizedSandboxId);
    }
  }
}
