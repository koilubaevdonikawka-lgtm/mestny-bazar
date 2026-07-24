import type { Schema } from "@server/application/ai-schema-registry/models/schema.model";

/** Future integration point for schema synchronization. Not wired yet. */
export interface ISchemaSynchronizationProvider {
  synchronize(schemas: readonly Schema[]): Promise<void>;
}
