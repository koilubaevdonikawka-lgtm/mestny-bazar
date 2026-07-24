import type { ExecutionEnvironment } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

/** Future integration point for execution environment synchronization. Not wired yet. */
export interface IExecutionEnvironmentSynchronizationProvider {
  synchronize(executionEnvironments: readonly ExecutionEnvironment[]): Promise<void>;
}
