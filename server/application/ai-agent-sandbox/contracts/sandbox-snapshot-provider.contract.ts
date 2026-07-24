import type { SandboxSession } from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** Future integration point for sandbox snapshots. Not wired yet. */
export interface ISandboxSnapshotProvider {
  capture(session: SandboxSession): Promise<{ snapshotId: string }>;
  restore(snapshotId: string): Promise<SandboxSession>;
  delete(snapshotId: string): Promise<void>;
}
