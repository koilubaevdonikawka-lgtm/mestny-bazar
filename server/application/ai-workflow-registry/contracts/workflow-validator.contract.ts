import type {
  RegisterWorkflowInput,
  UpdateWorkflowInput,
  Workflow,
} from "@server/application/ai-workflow-registry/models/workflow.model";

export interface WorkflowValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IWorkflowValidator {
  validateRegistration(input: RegisterWorkflowInput): Promise<WorkflowValidationResult>;
  validateUpdate(existing: Workflow, input: UpdateWorkflowInput): Promise<WorkflowValidationResult>;
}
