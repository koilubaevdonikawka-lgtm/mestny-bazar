import type { ExecutionProfile } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

/** Future integration point for execution profile export. Not wired yet. */
export interface IExecutionProfileExportProvider {
  exportTo(executionProfiles: readonly ExecutionProfile[]): Promise<string>;
}
