import type { Schema } from "@server/application/ai-schema-registry/models/schema.model";

/** Future integration point for external schema providers. Not wired yet. */
export interface IRemoteSchemaProvider {
  fetchRemote(schemaId: string): Promise<Schema | null>;
  pushRemote(schema: Schema): Promise<void>;
}
