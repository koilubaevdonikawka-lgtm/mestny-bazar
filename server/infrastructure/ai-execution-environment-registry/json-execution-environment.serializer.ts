import type { IExecutionEnvironmentSerializer } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-serializer.contract";
import {
  createExecutionEnvironment,
  type ExecutionEnvironment,
} from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

/** JSON-based execution environment serializer. */
export class JsonExecutionEnvironmentSerializer implements IExecutionEnvironmentSerializer {
  async serialize(executionEnvironment: ExecutionEnvironment): Promise<string> {
    return JSON.stringify(executionEnvironment);
  }

  async deserialize(serialized: string): Promise<ExecutionEnvironment> {
    if (!serialized.trim()) {
      throw new Error("Serialized execution environment cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ExecutionEnvironment>;
    return createExecutionEnvironment({
      executionEnvironmentId: parsed.executionEnvironmentId ?? "",
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
