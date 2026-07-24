import type {
  RegisterRelationInput,
  Relation,
  UpdateRelationInput,
} from "@server/application/ai-relation-registry/models/relation.model";

export interface RelationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IRelationValidator {
  validateRegistration(input: RegisterRelationInput): Promise<RelationValidationResult>;
  validateUpdate(existing: Relation, input: UpdateRelationInput): Promise<RelationValidationResult>;
}
