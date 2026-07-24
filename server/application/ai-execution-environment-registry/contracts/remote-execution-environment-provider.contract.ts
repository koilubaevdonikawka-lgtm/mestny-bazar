import type { ExecutionEnvironment } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

/** Future integration point for external execution environment providers. Not wired yet. */
export interface IRemoteExecutionEnvironmentProvider {
  fetchRemote(executionEnvironmentId: string): Promise<ExecutionEnvironment | null>;
  pushRemote(executionEnvironment: ExecutionEnvironment): Promise<void>;
}
