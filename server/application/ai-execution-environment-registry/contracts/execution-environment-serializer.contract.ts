import type { ExecutionEnvironment } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

export interface IExecutionEnvironmentSerializer {
  serialize(executionEnvironment: ExecutionEnvironment): Promise<string>;
  deserialize(serialized: string): Promise<ExecutionEnvironment>;
}
