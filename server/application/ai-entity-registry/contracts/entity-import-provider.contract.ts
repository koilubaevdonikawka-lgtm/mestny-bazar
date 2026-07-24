import type { Entity } from "@server/application/ai-entity-registry/models/entity.model";

/** Future integration point for entity import. Not wired yet. */
export interface IEntityImportProvider {
  importFrom(source: string): Promise<readonly Entity[]>;
}
