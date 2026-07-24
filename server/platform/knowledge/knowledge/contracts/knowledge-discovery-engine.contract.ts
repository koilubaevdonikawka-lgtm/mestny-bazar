import type { KnowledgeNode } from "@server/platform/knowledge/knowledge/models";

/** Contract for knowledge discovery from platform metadata. */
export interface IKnowledgeDiscoveryEngine {
  discover(): readonly KnowledgeNode[];
}
