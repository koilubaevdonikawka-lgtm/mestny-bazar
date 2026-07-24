import type { ExecutionProfile } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

export interface IExecutionProfileCatalog {
  register(executionProfile: ExecutionProfile): Promise<void>;
  remove(executionProfileId: string): Promise<void>;
  findById(executionProfileId: string): Promise<ExecutionProfile | null>;
  findByName(name: string): Promise<ExecutionProfile | null>;
  findByCategory(category: string): Promise<readonly ExecutionProfile[]>;
  listAll(): Promise<readonly ExecutionProfile[]>;
}
