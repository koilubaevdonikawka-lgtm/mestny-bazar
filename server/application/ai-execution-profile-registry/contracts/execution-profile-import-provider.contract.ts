import type { ExecutionProfile } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

/** Future integration point for execution profile import. Not wired yet. */
export interface IExecutionProfileImportProvider {
  importFrom(source: string): Promise<readonly ExecutionProfile[]>;
}
