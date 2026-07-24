import type { Sandbox, SandboxSession } from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** Future integration point for VM-based sandboxes. Not wired yet. */
export interface IVirtualMachineSandboxProvider {
  createVm(sandbox: Sandbox): Promise<{ vmId: string }>;
  destroyVm(vmId: string): Promise<void>;
  attachSession(session: SandboxSession, vmId: string): Promise<void>;
}
