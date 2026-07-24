import type { Schema } from "@server/application/ai-schema-registry/models/schema.model";

export interface ISchemaCatalog {
  register(schema: Schema): Promise<void>;
  remove(schemaId: string): Promise<void>;
  findById(schemaId: string): Promise<Schema | null>;
  findByName(name: string): Promise<Schema | null>;
  findByCategory(category: string): Promise<readonly Schema[]>;
  listAll(): Promise<readonly Schema[]>;
}
