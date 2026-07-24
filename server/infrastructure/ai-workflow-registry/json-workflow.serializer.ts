import type { IWorkflowSerializer } from "@server/application/ai-workflow-registry/contracts/workflow-serializer.contract";
import {
  createWorkflow,
  type Workflow,
} from "@server/application/ai-workflow-registry/models/workflow.model";

/** JSON-based workflow serializer. */
export class JsonWorkflowSerializer implements IWorkflowSerializer {
  async serialize(workflow: Workflow): Promise<string> {
    return JSON.stringify(workflow);
  }

  async deserialize(serialized: string): Promise<Workflow> {
    if (!serialized.trim()) {
      throw new Error("Serialized workflow cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Workflow>;
    return createWorkflow({
      workflowId: parsed.workflowId ?? "",
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
