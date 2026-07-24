import type {
  IWorkflowTemplateValidator,
  WorkflowTemplateValidationResult,
} from "@server/application/ai-workflow-template-registry/contracts/workflow-template-validator.contract";
import type {
  RegisterWorkflowTemplateInput,
  WorkflowTemplate,
  UpdateWorkflowTemplateInput,
} from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** Default workflow template validator. */
export class DefaultWorkflowTemplateValidator implements IWorkflowTemplateValidator {
  async validateRegistration(
    input: RegisterWorkflowTemplateInput,
  ): Promise<WorkflowTemplateValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Workflow template name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Workflow template category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Workflow template status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: WorkflowTemplate,
    input: UpdateWorkflowTemplateInput,
  ): Promise<WorkflowTemplateValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Workflow template name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Workflow template category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Workflow template status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Workflow template is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
