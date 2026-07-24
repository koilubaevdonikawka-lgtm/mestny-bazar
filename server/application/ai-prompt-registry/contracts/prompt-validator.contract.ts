import type {
  Prompt,
  RegisterPromptInput,
  UpdatePromptInput,
} from "@server/application/ai-prompt-registry/models/prompt.model";

export interface PromptValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IPromptValidator {
  validateRegistration(input: RegisterPromptInput): Promise<PromptValidationResult>;
  validateUpdate(existing: Prompt, input: UpdatePromptInput): Promise<PromptValidationResult>;
}
