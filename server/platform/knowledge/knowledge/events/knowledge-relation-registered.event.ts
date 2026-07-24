import type { KnowledgeRelation } from "@server/platform/knowledge/knowledge/models";

export interface KnowledgeRelationRegisteredEvent {
  readonly type: "knowledge.relation.registered";
  readonly relation: KnowledgeRelation;
}

export function createKnowledgeRelationRegisteredEvent(
  relation: KnowledgeRelation,
): KnowledgeRelationRegisteredEvent {
  return Object.freeze({ type: "knowledge.relation.registered", relation });
}
