import type {
  RegisterEntityInput,
  Entity,
  UpdateEntityInput,
} from "@server/application/ai-entity-registry/models/entity.model";

export interface EntityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IEntityValidator {
  validateRegistration(input: RegisterEntityInput): Promise<EntityValidationResult>;
  validateUpdate(existing: Entity, input: UpdateEntityInput): Promise<EntityValidationResult>;
}
