import type { ExecutionEnvironment } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

/** Future integration point for execution environment export. Not wired yet. */
export interface IExecutionEnvironmentExportProvider {
  exportExecutionEnvironments(executionEnvironments: readonly ExecutionEnvironment[]): Promise<string>;
}
