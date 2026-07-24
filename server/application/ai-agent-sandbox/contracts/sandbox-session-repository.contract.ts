import type { SandboxSession } from "@server/application/ai-agent-sandbox/models/sandbox.model";

export interface ISandboxSessionRepository {
  save(session: SandboxSession): Promise<void>;
  findById(sessionId: string): Promise<SandboxSession | null>;
  findBySandboxId(sandboxId: string): Promise<readonly SandboxSession[]>;
  findAll(): Promise<readonly SandboxSession[]>;
  delete(sessionId: string): Promise<boolean>;
  deleteBySandboxId(sandboxId: string): Promise<number>;
}
