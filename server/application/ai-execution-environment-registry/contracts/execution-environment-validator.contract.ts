import type {
  ExecutionEnvironment,
  RegisterExecutionEnvironmentInput,
  UpdateExecutionEnvironmentInput,
} from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

export interface ExecutionEnvironmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IExecutionEnvironmentValidator {
  validateRegistration(
    input: RegisterExecutionEnvironmentInput,
  ): Promise<ExecutionEnvironmentValidationResult>;
  validateUpdate(
    existing: ExecutionEnvironment,
    input: UpdateExecutionEnvironmentInput,
  ): Promise<ExecutionEnvironmentValidationResult>;
}
