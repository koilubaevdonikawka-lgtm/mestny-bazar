import type { ExecutionProfile } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

/** Future integration point for external execution profile providers. Not wired yet. */
export interface IRemoteExecutionProfileProvider {
  fetchRemote(executionProfileId: string): Promise<ExecutionProfile | null>;
  pushRemote(executionProfile: ExecutionProfile): Promise<void>;
}
