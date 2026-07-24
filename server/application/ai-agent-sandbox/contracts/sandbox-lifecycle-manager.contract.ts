import type { SandboxSession } from "@server/application/ai-agent-sandbox/models/sandbox.model";

export interface SandboxLifecycleResult {
  readonly session: SandboxSession;
  readonly mock: boolean;
}

export interface ISandboxLifecycleManager {
  initialize(session: SandboxSession): Promise<SandboxLifecycleResult>;
  start(session: SandboxSession): Promise<SandboxLifecycleResult>;
  terminate(session: SandboxSession): Promise<SandboxLifecycleResult>;
}
