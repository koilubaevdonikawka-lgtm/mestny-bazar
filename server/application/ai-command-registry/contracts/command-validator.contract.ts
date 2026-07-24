import type {
  RegisterCommandInput,
  Command,
  UpdateCommandInput,
} from "@server/application/ai-command-registry/models/command.model";

export interface CommandValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ICommandValidator {
  validateRegistration(input: RegisterCommandInput): Promise<CommandValidationResult>;
  validateUpdate(existing: Command, input: UpdateCommandInput): Promise<CommandValidationResult>;
}
