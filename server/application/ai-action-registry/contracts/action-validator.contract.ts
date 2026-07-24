import type {
  RegisterActionInput,
  Action,
  UpdateActionInput,
} from "@server/application/ai-action-registry/models/action.model";

export interface ActionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IActionValidator {
  validateRegistration(input: RegisterActionInput): Promise<ActionValidationResult>;
  validateUpdate(existing: Action, input: UpdateActionInput): Promise<ActionValidationResult>;
}
