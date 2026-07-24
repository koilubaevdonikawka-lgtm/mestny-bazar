import type {
  RegisterWorkflowTemplateInput,
  WorkflowTemplate,
  UpdateWorkflowTemplateInput,
} from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

export interface WorkflowTemplateValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IWorkflowTemplateValidator {
  validateRegistration(input: RegisterWorkflowTemplateInput): Promise<WorkflowTemplateValidationResult>;
  validateUpdate(
    existing: WorkflowTemplate,
    input: UpdateWorkflowTemplateInput,
  ): Promise<WorkflowTemplateValidationResult>;
}
