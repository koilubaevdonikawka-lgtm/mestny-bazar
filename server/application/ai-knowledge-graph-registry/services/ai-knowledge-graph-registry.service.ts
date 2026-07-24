/**
 * AI Knowledge Graph Registry — unified registry for AI knowledge graphs.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IKnowledgeGraphCatalog } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-catalog.contract";
import type { IKnowledgeGraphRepository } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-repository.contract";
import type { IKnowledgeGraphSerializer } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-serializer.contract";
import type { IKnowledgeGraphStatisticsProvider } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-statistics-provider.contract";
import type { IKnowledgeGraphValidator } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-validator.contract";
import {
  createKnowledgeGraph,
  type DeleteKnowledgeGraphResult,
  type FindKnowledgeGraphByNameResult,
  type ListKnowledgeGraphsByCategoryResult,
  type ListKnowledgeGraphsResult,
  type RegisterKnowledgeGraphInput,
  type KnowledgeGraph,
  type KnowledgeGraphRegistryStatistics,
  type UpdateKnowledgeGraphInput,
} from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiKnowledgeGraphRegistryService {
  constructor(
    private readonly knowledgeGraphRepository: IKnowledgeGraphRepository,
    private readonly knowledgeGraphCatalog: IKnowledgeGraphCatalog,
    private readonly knowledgeGraphValidator: IKnowledgeGraphValidator,
    private readonly knowledgeGraphSerializer: IKnowledgeGraphSerializer,
    private readonly statisticsProvider: IKnowledgeGraphStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerKnowledgeGraph(input: RegisterKnowledgeGraphInput): Promise<KnowledgeGraph> {
    const validation = await this.knowledgeGraphValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.knowledgeGraphRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Knowledge graph already exists with name: ${input.name.trim()}`);
    }

    const knowledgeGraph = createKnowledgeGraph({
      knowledgeGraphId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.knowledgeGraphRepository.save(knowledgeGraph);
    await this.knowledgeGraphCatalog.register(knowledgeGraph);
    return knowledgeGraph;
  }

  async getKnowledgeGraph(knowledgeGraphId: string): Promise<KnowledgeGraph | null> {
    return this.knowledgeGraphRepository.findById(knowledgeGraphId.trim());
  }

  async listKnowledgeGraphs(): Promise<ListKnowledgeGraphsResult> {
    const knowledgeGraphs = Object.freeze(
      [...(await this.knowledgeGraphRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ knowledgeGraphs, total: knowledgeGraphs.length });
  }

  async updateKnowledgeGraph(input: UpdateKnowledgeGraphInput): Promise<KnowledgeGraph> {
    const knowledgeGraphId = input.knowledgeGraphId.trim();
    const existing = await this.knowledgeGraphRepository.findById(knowledgeGraphId);
    if (!existing) {
      throw new Error(`Knowledge graph not found: ${knowledgeGraphId}`);
    }

    const validation = await this.knowledgeGraphValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.knowledgeGraphRepository.findByName(input.name.trim());
      if (duplicate && duplicate.knowledgeGraphId !== existing.knowledgeGraphId) {
        throw new Error(`Knowledge graph already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createKnowledgeGraph({
      knowledgeGraphId: existing.knowledgeGraphId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.knowledgeGraphRepository.save(updated);
    await this.knowledgeGraphCatalog.register(updated);
    return updated;
  }

  async deleteKnowledgeGraph(knowledgeGraphId: string): Promise<DeleteKnowledgeGraphResult> {
    const normalizedKnowledgeGraphId = knowledgeGraphId.trim();
    const deleted = await this.knowledgeGraphRepository.delete(normalizedKnowledgeGraphId);
    if (deleted) {
      await this.knowledgeGraphCatalog.remove(normalizedKnowledgeGraphId);
    }
    return Object.freeze({ knowledgeGraphId: normalizedKnowledgeGraphId, deleted });
  }

  async findKnowledgeGraphByName(name: string): Promise<FindKnowledgeGraphByNameResult> {
    const normalizedName = name.trim();
    const knowledgeGraph = await this.knowledgeGraphRepository.findByName(normalizedName);
    return Object.freeze({ knowledgeGraph });
  }

  async listKnowledgeGraphsByCategory(
    category: string,
  ): Promise<ListKnowledgeGraphsByCategoryResult> {
    const normalizedCategory = category.trim();
    const knowledgeGraphs = Object.freeze(
      [...(await this.knowledgeGraphRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      knowledgeGraphs,
      total: knowledgeGraphs.length,
      category: normalizedCategory,
    });
  }

  async getKnowledgeGraphRegistryStatistics(): Promise<KnowledgeGraphRegistryStatistics> {
    const knowledgeGraphs = await this.knowledgeGraphRepository.findAll();
    const activeKnowledgeGraphs = knowledgeGraphs.filter(
      (knowledgeGraph) => knowledgeGraph.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(knowledgeGraphs.map((knowledgeGraph) => knowledgeGraph.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalKnowledgeGraphs: knowledgeGraphs.length,
      activeKnowledgeGraphs,
      categories,
    });
  }

  async serializeKnowledgeGraph(knowledgeGraph: KnowledgeGraph): Promise<string> {
    return this.knowledgeGraphSerializer.serialize(knowledgeGraph);
  }

  async deserializeKnowledgeGraph(serialized: string): Promise<KnowledgeGraph> {
    return this.knowledgeGraphSerializer.deserialize(serialized);
  }
}
