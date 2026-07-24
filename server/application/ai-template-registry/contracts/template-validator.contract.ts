import type {
  RegisterTemplateInput,
  Template,
  UpdateTemplateInput,
} from "@server/application/ai-template-registry/models/template.model";

export interface TemplateValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ITemplateValidator {
  validateRegistration(input: RegisterTemplateInput): Promise<TemplateValidationResult>;
  validateUpdate(existing: Template, input: UpdateTemplateInput): Promise<TemplateValidationResult>;
}
