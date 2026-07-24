import type { ExecutionEnvironment } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

export interface IExecutionEnvironmentRepository {
  save(executionEnvironment: ExecutionEnvironment): Promise<void>;
  findById(executionEnvironmentId: string): Promise<ExecutionEnvironment | null>;
  findByName(name: string): Promise<ExecutionEnvironment | null>;
  findByCategory(category: string): Promise<readonly ExecutionEnvironment[]>;
  findAll(): Promise<readonly ExecutionEnvironment[]>;
  delete(executionEnvironmentId: string): Promise<boolean>;
}
