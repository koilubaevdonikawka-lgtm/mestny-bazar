import type { ExecutionEnvironment } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

/** Future integration point for execution environment import. Not wired yet. */
export interface IExecutionEnvironmentImportProvider {
  importExecutionEnvironments(source: string): Promise<readonly ExecutionEnvironment[]>;
}
