import type {
  RegisterSchemaInput,
  Schema,
  UpdateSchemaInput,
} from "@server/application/ai-schema-registry/models/schema.model";

export interface SchemaValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ISchemaValidator {
  validateRegistration(input: RegisterSchemaInput): Promise<SchemaValidationResult>;
  validateUpdate(existing: Schema, input: UpdateSchemaInput): Promise<SchemaValidationResult>;
}
