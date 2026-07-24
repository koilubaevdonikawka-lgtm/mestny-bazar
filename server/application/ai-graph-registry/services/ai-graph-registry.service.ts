/**
 * AI Graph Registry — unified registry for AI graphs.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IGraphCatalog } from "@server/application/ai-graph-registry/contracts/graph-catalog.contract";
import type { IGraphRepository } from "@server/application/ai-graph-registry/contracts/graph-repository.contract";
import type { IGraphSerializer } from "@server/application/ai-graph-registry/contracts/graph-serializer.contract";
import type { IGraphStatisticsProvider } from "@server/application/ai-graph-registry/contracts/graph-statistics-provider.contract";
import type { IGraphValidator } from "@server/application/ai-graph-registry/contracts/graph-validator.contract";
import {
  createGraph,
  type DeleteGraphResult,
  type FindGraphByNameResult,
  type ListGraphsByCategoryResult,
  type ListGraphsResult,
  type RegisterGraphInput,
  type Graph,
  type GraphRegistryStatistics,
  type UpdateGraphInput,
} from "@server/application/ai-graph-registry/models/graph.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiGraphRegistryService {
  constructor(
    private readonly graphRepository: IGraphRepository,
    private readonly graphCatalog: IGraphCatalog,
    private readonly graphValidator: IGraphValidator,
    private readonly graphSerializer: IGraphSerializer,
    private readonly statisticsProvider: IGraphStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerGraph(input: RegisterGraphInput): Promise<Graph> {
    const validation = await this.graphValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.graphRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Graph already exists with name: ${input.name.trim()}`);
    }

    const graph = createGraph({
      graphId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.graphRepository.save(graph);
    await this.graphCatalog.register(graph);
    return graph;
  }

  async getGraph(graphId: string): Promise<Graph | null> {
    return this.graphRepository.findById(graphId.trim());
  }

  async listGraphs(): Promise<ListGraphsResult> {
    const graphs = Object.freeze(
      [...(await this.graphRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ graphs, total: graphs.length });
  }

  async updateGraph(input: UpdateGraphInput): Promise<Graph> {
    const graphId = input.graphId.trim();
    const existing = await this.graphRepository.findById(graphId);
    if (!existing) {
      throw new Error(`Graph not found: ${graphId}`);
    }

    const validation = await this.graphValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.graphRepository.findByName(input.name.trim());
      if (duplicate && duplicate.graphId !== existing.graphId) {
        throw new Error(`Graph already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createGraph({
      graphId: existing.graphId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.graphRepository.save(updated);
    await this.graphCatalog.register(updated);
    return updated;
  }

  async deleteGraph(graphId: string): Promise<DeleteGraphResult> {
    const normalizedGraphId = graphId.trim();
    const deleted = await this.graphRepository.delete(normalizedGraphId);
    if (deleted) {
      await this.graphCatalog.remove(normalizedGraphId);
    }
    return Object.freeze({ graphId: normalizedGraphId, deleted });
  }

  async findGraphByName(name: string): Promise<FindGraphByNameResult> {
    const normalizedName = name.trim();
    const graph = await this.graphRepository.findByName(normalizedName);
    return Object.freeze({ graph });
  }

  async listGraphsByCategory(category: string): Promise<ListGraphsByCategoryResult> {
    const normalizedCategory = category.trim();
    const graphs = Object.freeze(
      [...(await this.graphRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      graphs,
      total: graphs.length,
      category: normalizedCategory,
    });
  }

  async getGraphRegistryStatistics(): Promise<GraphRegistryStatistics> {
    const graphs = await this.graphRepository.findAll();
    const activeGraphs = graphs.filter((graph) => graph.status === "active").length;
    const categories = Object.freeze([
      ...new Set(graphs.map((graph) => graph.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalGraphs: graphs.length,
      activeGraphs,
      categories,
    });
  }

  async serializeGraph(graph: Graph): Promise<string> {
    return this.graphSerializer.serialize(graph);
  }

  async deserializeGraph(serialized: string): Promise<Graph> {
    return this.graphSerializer.deserialize(serialized);
  }
}
