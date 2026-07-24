import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

/** Future integration point for relation synchronization. Not wired yet. */
export interface IRelationSynchronizationProvider {
  synchronize(relations: readonly Relation[]): Promise<void>;
}
