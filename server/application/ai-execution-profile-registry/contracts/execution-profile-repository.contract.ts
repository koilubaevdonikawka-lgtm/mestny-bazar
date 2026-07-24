import type { ExecutionProfile } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

export interface IExecutionProfileRepository {
  save(executionProfile: ExecutionProfile): Promise<void>;
  findById(executionProfileId: string): Promise<ExecutionProfile | null>;
  findByName(name: string): Promise<ExecutionProfile | null>;
  findByCategory(category: string): Promise<readonly ExecutionProfile[]>;
  findAll(): Promise<readonly ExecutionProfile[]>;
  delete(executionProfileId: string): Promise<boolean>;
}
