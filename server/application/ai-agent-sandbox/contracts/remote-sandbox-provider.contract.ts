import type { Sandbox, SandboxSession } from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** Future integration point for remote sandbox providers. Not wired yet. */
export interface IRemoteSandboxProvider {
  allocateRemote(sandbox: Sandbox): Promise<{ remoteId: string }>;
  releaseRemote(remoteId: string): Promise<void>;
  syncSession(session: SandboxSession, remoteId: string): Promise<void>;
}
