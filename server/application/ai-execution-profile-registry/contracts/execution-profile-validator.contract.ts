import type {
  RegisterExecutionProfileInput,
  ExecutionProfile,
  UpdateExecutionProfileInput,
} from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

export interface ExecutionProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IExecutionProfileValidator {
  validateRegistration(input: RegisterExecutionProfileInput): Promise<ExecutionProfileValidationResult>;
  validateUpdate(existing: ExecutionProfile, input: UpdateExecutionProfileInput): Promise<ExecutionProfileValidationResult>;
}
