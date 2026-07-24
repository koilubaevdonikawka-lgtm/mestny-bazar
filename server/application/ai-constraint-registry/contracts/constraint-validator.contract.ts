import type {
  RegisterConstraintInput,
  Constraint,
  UpdateConstraintInput,
} from "@server/application/ai-constraint-registry/models/constraint.model";

export interface ConstraintValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IConstraintValidator {
  validateRegistration(input: RegisterConstraintInput): Promise<ConstraintValidationResult>;
  validateUpdate(existing: Constraint, input: UpdateConstraintInput): Promise<ConstraintValidationResult>;
}
