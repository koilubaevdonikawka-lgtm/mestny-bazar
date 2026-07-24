export {
  type KnowledgeNodeRegisteredEvent,
  createKnowledgeNodeRegisteredEvent,
} from "./knowledge-node-registered.event";
export {
  type KnowledgeRelationRegisteredEvent,
  createKnowledgeRelationRegisteredEvent,
} from "./knowledge-relation-registered.event";
export {
  type KnowledgeDiscoveredEvent,
  createKnowledgeDiscoveredEvent,
} from "./knowledge-discovered.event";
export {
  type KnowledgeQueryExecutedEvent,
  createKnowledgeQueryExecutedEvent,
} from "./knowledge-query-executed.event";
export {
  type KnowledgeGraphGeneratedEvent,
  createKnowledgeGraphGeneratedEvent,
} from "./knowledge-graph-generated.event";

export type KnowledgePlatformEvent =
  | KnowledgeNodeRegisteredEvent
  | KnowledgeRelationRegisteredEvent
  | KnowledgeDiscoveredEvent
  | KnowledgeQueryExecutedEvent
  | KnowledgeGraphGeneratedEvent;
