/** DI tokens for the knowledge platform. */
export const KnowledgeTokens = {
  KnowledgePlatform: Symbol.for("knowledge.platform"),
  KnowledgeManager: Symbol.for("knowledge.manager"),
  KnowledgeRegistry: Symbol.for("knowledge.registry"),
  KnowledgeGraphEngine: Symbol.for("knowledge.graphEngine"),
  RelationRegistry: Symbol.for("knowledge.relationRegistry"),
  KnowledgeDiscoveryEngine: Symbol.for("knowledge.discoveryEngine"),
  KnowledgeQueryEngine: Symbol.for("knowledge.queryEngine"),
} as const;

export type KnowledgeToken = (typeof KnowledgeTokens)[keyof typeof KnowledgeTokens];
