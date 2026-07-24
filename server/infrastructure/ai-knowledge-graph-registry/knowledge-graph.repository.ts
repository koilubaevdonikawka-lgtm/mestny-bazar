import type { IKnowledgeGraphRepository } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-repository.contract";
import type { KnowledgeGraph } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

/** In-memory knowledge graph store. */
export class KnowledgeGraphRepository implements IKnowledgeGraphRepository {
  private readonly knowledgeGraphs = new Map<string, KnowledgeGraph>();
  private readonly knowledgeGraphsByName = new Map<string, string>();
  private readonly knowledgeGraphsByCategory = new Map<string, Set<string>>();

  async save(knowledgeGraph: KnowledgeGraph): Promise<void> {
    const existing = this.knowledgeGraphs.get(knowledgeGraph.knowledgeGraphId);
    if (existing) {
      if (existing.name !== knowledgeGraph.name) {
        this.knowledgeGraphsByName.delete(existing.name);
      }
      if (existing.category !== knowledgeGraph.category) {
        this.removeFromCategory(existing.category, existing.knowledgeGraphId);
      }
    }

    this.knowledgeGraphs.set(knowledgeGraph.knowledgeGraphId, knowledgeGraph);
    this.knowledgeGraphsByName.set(knowledgeGraph.name, knowledgeGraph.knowledgeGraphId);
    this.addToCategory(knowledgeGraph.category, knowledgeGraph.knowledgeGraphId);
  }

  async findById(knowledgeGraphId: string): Promise<KnowledgeGraph | null> {
    return this.knowledgeGraphs.get(knowledgeGraphId.trim()) ?? null;
  }

  async findByName(name: string): Promise<KnowledgeGraph | null> {
    const knowledgeGraphId = this.knowledgeGraphsByName.get(name.trim());
    if (!knowledgeGraphId) {
      return null;
    }
    return this.knowledgeGraphs.get(knowledgeGraphId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly KnowledgeGraph[]> {
    const knowledgeGraphIds = this.knowledgeGraphsByCategory.get(category.trim());
    if (!knowledgeGraphIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...knowledgeGraphIds]
        .map((knowledgeGraphId) => this.knowledgeGraphs.get(knowledgeGraphId))
        .filter((knowledgeGraph): knowledgeGraph is KnowledgeGraph => knowledgeGraph !== undefined),
    );
  }

  async findAll(): Promise<readonly KnowledgeGraph[]> {
    return Object.freeze([...this.knowledgeGraphs.values()]);
  }

  async delete(knowledgeGraphId: string): Promise<boolean> {
    const knowledgeGraph = await this.findById(knowledgeGraphId);
    if (!knowledgeGraph) {
      return false;
    }
    this.knowledgeGraphs.delete(knowledgeGraph.knowledgeGraphId);
    this.knowledgeGraphsByName.delete(knowledgeGraph.name);
    this.removeFromCategory(knowledgeGraph.category, knowledgeGraph.knowledgeGraphId);
    return true;
  }

  private addToCategory(category: string, knowledgeGraphId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.knowledgeGraphsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(knowledgeGraphId);
    this.knowledgeGraphsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, knowledgeGraphId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.knowledgeGraphsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(knowledgeGraphId);
    if (categorySet.size === 0) {
      this.knowledgeGraphsByCategory.delete(normalizedCategory);
    }
  }
}
