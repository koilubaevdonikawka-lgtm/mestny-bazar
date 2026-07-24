import type { IExecutionProfileSerializer } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-serializer.contract";
import {
  createExecutionProfile,
  type ExecutionProfile,
} from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

/** JSON-based execution profile serializer. */
export class JsonExecutionProfileSerializer implements IExecutionProfileSerializer {
  async serialize(executionProfile: ExecutionProfile): Promise<string> {
    return JSON.stringify(executionProfile);
  }

  async deserialize(serialized: string): Promise<ExecutionProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized execution profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ExecutionProfile>;
    return createExecutionProfile({
      executionProfileId: parsed.executionProfileId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
