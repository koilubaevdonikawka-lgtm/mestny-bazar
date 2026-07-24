import type { Entity } from "@server/application/ai-entity-registry/models/entity.model";

/** Future integration point for entity synchronization. Not wired yet. */
export interface IEntitySynchronizationProvider {
  synchronize(entities: readonly Entity[]): Promise<void>;
}
