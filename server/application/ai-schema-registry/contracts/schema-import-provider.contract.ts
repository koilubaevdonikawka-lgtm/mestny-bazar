import type { Schema } from "@server/application/ai-schema-registry/models/schema.model";

/** Future integration point for schema import. Not wired yet. */
export interface ISchemaImportProvider {
  importFrom(source: string): Promise<readonly Schema[]>;
}
