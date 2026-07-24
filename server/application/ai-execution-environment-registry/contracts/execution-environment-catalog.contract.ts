import type { ExecutionEnvironment } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

export interface IExecutionEnvironmentCatalog {
  register(executionEnvironment: ExecutionEnvironment): Promise<void>;
  remove(executionEnvironmentId: string): Promise<void>;
  findById(executionEnvironmentId: string): Promise<ExecutionEnvironment | null>;
  findByName(name: string): Promise<ExecutionEnvironment | null>;
  findByCategory(category: string): Promise<readonly ExecutionEnvironment[]>;
  listAll(): Promise<readonly ExecutionEnvironment[]>;
}
