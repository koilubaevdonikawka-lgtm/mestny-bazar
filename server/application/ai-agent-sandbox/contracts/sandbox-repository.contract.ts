import type { Sandbox } from "@server/application/ai-agent-sandbox/models/sandbox.model";

export interface ISandboxRepository {
  save(sandbox: Sandbox): Promise<void>;
  findById(sandboxId: string): Promise<Sandbox | null>;
  findByName(name: string): Promise<Sandbox | null>;
  findAll(): Promise<readonly Sandbox[]>;
  delete(sandboxId: string): Promise<boolean>;
}
