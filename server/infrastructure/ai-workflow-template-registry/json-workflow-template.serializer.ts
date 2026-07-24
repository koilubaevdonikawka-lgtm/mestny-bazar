import type { IWorkflowTemplateSerializer } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-serializer.contract";
import {
  createWorkflowTemplate,
  type WorkflowTemplate,
} from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** JSON-based workflow template serializer. */
export class JsonWorkflowTemplateSerializer implements IWorkflowTemplateSerializer {
  async serialize(workflowTemplate: WorkflowTemplate): Promise<string> {
    return JSON.stringify(workflowTemplate);
  }

  async deserialize(serialized: string): Promise<WorkflowTemplate> {
    if (!serialized.trim()) {
      throw new Error("Serialized workflow template cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<WorkflowTemplate>;
    return createWorkflowTemplate({
      workflowTemplateId: parsed.workflowTemplateId ?? "",
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
