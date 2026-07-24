import type {
  IWorkflowValidator,
  WorkflowValidationResult,
} from "@server/application/ai-workflow-registry/contracts/workflow-validator.contract";
import type {
  RegisterWorkflowInput,
  UpdateWorkflowInput,
  Workflow,
} from "@server/application/ai-workflow-registry/models/workflow.model";

/** Default workflow validator. */
export class DefaultWorkflowValidator implements IWorkflowValidator {
  async validateRegistration(input: RegisterWorkflowInput): Promise<WorkflowValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Workflow name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Workflow category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Workflow status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Workflow,
    input: UpdateWorkflowInput,
  ): Promise<WorkflowValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Workflow name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Workflow category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Workflow status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Workflow is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
