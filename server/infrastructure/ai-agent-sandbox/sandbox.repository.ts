import type { ISandboxRepository } from "@server/application/ai-agent-sandbox/contracts/sandbox-repository.contract";
import type { Sandbox } from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** In-memory sandbox store. */
export class SandboxRepository implements ISandboxRepository {
  private readonly sandboxes = new Map<string, Sandbox>();
  private readonly sandboxesByName = new Map<string, string>();

  async save(sandbox: Sandbox): Promise<void> {
    const existing = this.sandboxes.get(sandbox.sandboxId);
    if (existing && existing.name !== sandbox.name) {
      this.sandboxesByName.delete(existing.name);
    }

    this.sandboxes.set(sandbox.sandboxId, sandbox);
    this.sandboxesByName.set(sandbox.name, sandbox.sandboxId);
  }

  async findById(sandboxId: string): Promise<Sandbox | null> {
    return this.sandboxes.get(sandboxId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Sandbox | null> {
    const sandboxId = this.sandboxesByName.get(name.trim());
    if (!sandboxId) {
      return null;
    }
    return this.findById(sandboxId);
  }

  async findAll(): Promise<readonly Sandbox[]> {
    return Object.freeze([...this.sandboxes.values()]);
  }

  async delete(sandboxId: string): Promise<boolean> {
    const sandbox = await this.findById(sandboxId);
    if (!sandbox) {
      return false;
    }
    this.sandboxes.delete(sandbox.sandboxId);
    this.sandboxesByName.delete(sandbox.name);
    return true;
  }
}
