import type { Entity } from "@server/application/ai-entity-registry/models/entity.model";

/** Future integration point for external entity providers. Not wired yet. */
export interface IRemoteEntityProvider {
  fetchRemote(entityId: string): Promise<Entity | null>;
  pushRemote(entity: Entity): Promise<void>;
}
