import type { KnowledgeGraph } from "@server/platform/knowledge/knowledge/models";

export interface KnowledgeGraphGeneratedEvent {
  readonly type: "knowledge.graph.generated";
  readonly graph: KnowledgeGraph;
}

export function createKnowledgeGraphGeneratedEvent(
  graph: KnowledgeGraph,
): KnowledgeGraphGeneratedEvent {
  return Object.freeze({ type: "knowledge.graph.generated", graph });
}
