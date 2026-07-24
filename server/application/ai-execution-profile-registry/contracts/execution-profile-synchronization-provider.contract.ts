import type { ExecutionProfile } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

/** Future integration point for execution profile synchronization. Not wired yet. */
export interface IExecutionProfileSynchronizationProvider {
  synchronize(executionProfiles: readonly ExecutionProfile[]): Promise<void>;
}
