import type { KnowledgeNode } from "@server/platform/knowledge/knowledge/models";

export interface KnowledgeDiscoveredEvent {
  readonly type: "knowledge.discovered";
  readonly nodes: readonly KnowledgeNode[];
}

export function createKnowledgeDiscoveredEvent(
  nodes: readonly KnowledgeNode[],
): KnowledgeDiscoveredEvent {
  return Object.freeze({ type: "knowledge.discovered", nodes });
}
