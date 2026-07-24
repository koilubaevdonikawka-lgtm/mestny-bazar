import type {
  Context,
  CreateContextInput,
  UpdateContextInput,
} from "@server/application/ai-context-management/models/context.model";

export interface ContextValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IContextValidator {
  validateCreation(input: CreateContextInput): Promise<ContextValidationResult>;
  validateUpdate(existing: Context, input: UpdateContextInput): Promise<ContextValidationResult>;
}
