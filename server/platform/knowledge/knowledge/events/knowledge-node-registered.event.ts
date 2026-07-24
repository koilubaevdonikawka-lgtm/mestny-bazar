import type { KnowledgeNode } from "@server/platform/knowledge/knowledge/models";

export interface KnowledgeNodeRegisteredEvent {
  readonly type: "knowledge.node.registered";
  readonly node: KnowledgeNode;
}

export function createKnowledgeNodeRegisteredEvent(
  node: KnowledgeNode,
): KnowledgeNodeRegisteredEvent {
  return Object.freeze({ type: "knowledge.node.registered", node });
}
