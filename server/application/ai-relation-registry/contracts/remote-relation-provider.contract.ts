import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

/** Future integration point for external relation providers. Not wired yet. */
export interface IRemoteRelationProvider {
  fetchRemote(relationId: string): Promise<Relation | null>;
  pushRemote(relation: Relation): Promise<void>;
}
