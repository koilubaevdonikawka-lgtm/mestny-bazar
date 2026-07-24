import type {
  ISandboxLifecycleManager,
  SandboxLifecycleResult,
} from "@server/application/ai-agent-sandbox/contracts/sandbox-lifecycle-manager.contract";
import {
  createSandboxSession,
  type SandboxSession,
} from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** Mock sandbox lifecycle manager — no real process execution. */
export class DefaultSandboxLifecycleManager implements ISandboxLifecycleManager {
  async initialize(session: SandboxSession): Promise<SandboxLifecycleResult> {
    const initialized = createSandboxSession({
      ...session,
      status: "created",
      mock: true,
      updatedAt: new Date().toISOString(),
    });
    return Object.freeze({ session: initialized, mock: true });
  }

  async start(session: SandboxSession): Promise<SandboxLifecycleResult> {
    const started = createSandboxSession({
      ...session,
      status: "running",
      mock: true,
      updatedAt: new Date().toISOString(),
    });
    return Object.freeze({ session: started, mock: true });
  }

  async terminate(session: SandboxSession): Promise<SandboxLifecycleResult> {
    const terminated = createSandboxSession({
      ...session,
      status: "terminated",
      mock: true,
      updatedAt: new Date().toISOString(),
    });
    return Object.freeze({ session: terminated, mock: true });
  }
}
