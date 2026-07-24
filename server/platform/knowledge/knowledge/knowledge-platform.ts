import type { IKnowledgeManager } from "@server/platform/knowledge/knowledge/contracts";
import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeQuery,
  KnowledgeRelation,
  KnowledgeResult,
} from "@server/platform/knowledge/knowledge/models";

/** Public knowledge platform facade. */
export class KnowledgePlatform {
  constructor(private readonly manager: IKnowledgeManager) {}

  registerNode(node: KnowledgeNode): KnowledgeNode {
    return this.manager.registerNode(node);
  }

  registerRelation(relation: KnowledgeRelation): KnowledgeRelation {
    return this.manager.registerRelation(relation);
  }

  discoverKnowledge(): readonly KnowledgeNode[] {
    return this.manager.discoverKnowledge();
  }

  queryKnowledge(query: KnowledgeQuery): KnowledgeResult {
    return this.manager.queryKnowledge(query);
  }

  generateGraph(): KnowledgeGraph {
    return this.manager.generateGraph();
  }
}
