import type { ExecutionProfile } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

export interface IExecutionProfileSerializer {
  serialize(executionProfile: ExecutionProfile): Promise<string>;
  deserialize(serialized: string): Promise<ExecutionProfile>;
}
