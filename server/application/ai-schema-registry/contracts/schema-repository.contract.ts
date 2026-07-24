import type { Schema } from "@server/application/ai-schema-registry/models/schema.model";

export interface ISchemaRepository {
  save(schema: Schema): Promise<void>;
  findById(schemaId: string): Promise<Schema | null>;
  findByName(name: string): Promise<Schema | null>;
  findByCategory(category: string): Promise<readonly Schema[]>;
  findAll(): Promise<readonly Schema[]>;
  delete(schemaId: string): Promise<boolean>;
}
