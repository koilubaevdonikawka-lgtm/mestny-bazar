import type { Entity } from "@server/application/ai-entity-registry/models/entity.model";

/** Future integration point for entity export. Not wired yet. */
export interface IEntityExportProvider {
  exportTo(entities: readonly Entity[]): Promise<string>;
}
