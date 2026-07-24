import type { Sandbox, SandboxSession } from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** Future integration point for container-based sandboxes. Not wired yet. */
export interface IContainerSandboxProvider {
  provision(sandbox: Sandbox): Promise<{ containerId: string }>;
  destroy(containerId: string): Promise<void>;
  attachSession(session: SandboxSession, containerId: string): Promise<void>;
}
