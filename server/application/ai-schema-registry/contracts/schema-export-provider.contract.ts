import type { Schema } from "@server/application/ai-schema-registry/models/schema.model";

/** Future integration point for schema export. Not wired yet. */
export interface ISchemaExportProvider {
  exportTo(schemas: readonly Schema[]): Promise<string>;
}
