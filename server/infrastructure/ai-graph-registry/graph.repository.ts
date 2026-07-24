import type { IGraphRepository } from "@server/application/ai-graph-registry/contracts/graph-repository.contract";
import type { Graph } from "@server/application/ai-graph-registry/models/graph.model";

/** In-memory graph store. */
export class GraphRepository implements IGraphRepository {
  private readonly graphs = new Map<string, Graph>();
  private readonly graphsByName = new Map<string, string>();
  private readonly graphsByCategory = new Map<string, Set<string>>();

  async save(graph: Graph): Promise<void> {
    const existing = this.graphs.get(graph.graphId);
    if (existing) {
      if (existing.name !== graph.name) {
        this.graphsByName.delete(existing.name);
      }
      if (existing.category !== graph.category) {
        this.removeFromCategory(existing.category, existing.graphId);
      }
    }

    this.graphs.set(graph.graphId, graph);
    this.graphsByName.set(graph.name, graph.graphId);
    this.addToCategory(graph.category, graph.graphId);
  }

  async findById(graphId: string): Promise<Graph | null> {
    return this.graphs.get(graphId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Graph | null> {
    const graphId = this.graphsByName.get(name.trim());
    if (!graphId) {
      return null;
    }
    return this.graphs.get(graphId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Graph[]> {
    const graphIds = this.graphsByCategory.get(category.trim());
    if (!graphIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...graphIds]
        .map((graphId) => this.graphs.get(graphId))
        .filter((graph): graph is Graph => graph !== undefined),
    );
  }

  async findAll(): Promise<readonly Graph[]> {
    return Object.freeze([...this.graphs.values()]);
  }

  async delete(graphId: string): Promise<boolean> {
    const graph = await this.findById(graphId);
    if (!graph) {
      return false;
    }
    this.graphs.delete(graph.graphId);
    this.graphsByName.delete(graph.name);
    this.removeFromCategory(graph.category, graph.graphId);
    return true;
  }

  private addToCategory(category: string, graphId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.graphsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(graphId);
    this.graphsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, graphId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.graphsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(graphId);
    if (categorySet.size === 0) {
      this.graphsByCategory.delete(normalizedCategory);
    }
  }
}
