/**
 * AI Knowledge Registry — unified registry of knowledge sources for AI agents.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IKnowledgeCatalog } from "@server/application/ai-knowledge-registry/contracts/knowledge-catalog.contract";
import type { IKnowledgeSourceRepository } from "@server/application/ai-knowledge-registry/contracts/knowledge-source-repository.contract";
import type { IKnowledgeSerializer } from "@server/application/ai-knowledge-registry/contracts/knowledge-serializer.contract";
import type { IKnowledgeStatisticsProvider } from "@server/application/ai-knowledge-registry/contracts/knowledge-statistics-provider.contract";
import type { IKnowledgeValidator } from "@server/application/ai-knowledge-registry/contracts/knowledge-validator.contract";
import {
  createKnowledgeSource,
  type DeleteKnowledgeSourceResult,
  type FindKnowledgeSourceByNameResult,
  type KnowledgeRegistryStatistics,
  type KnowledgeSource,
  type ListKnowledgeSourcesByCategoryResult,
  type ListKnowledgeSourcesResult,
  type RegisterKnowledgeSourceInput,
  type UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-registry/models/knowledge-source.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiKnowledgeRegistryService {
  constructor(
    private readonly sourceRepository: IKnowledgeSourceRepository,
    private readonly knowledgeCatalog: IKnowledgeCatalog,
    private readonly knowledgeValidator: IKnowledgeValidator,
    private readonly knowledgeSerializer: IKnowledgeSerializer,
    private readonly statisticsProvider: IKnowledgeStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerKnowledgeSource(input: RegisterKnowledgeSourceInput): Promise<KnowledgeSource> {
    const validation = await this.knowledgeValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const name = input.name.trim();
    const category = input.category.trim();

    if (await this.sourceRepository.findByName(name)) {
      throw new Error(`Knowledge source already exists: ${name}`);
    }

    const source = createKnowledgeSource({
      knowledgeId: this.idGenerator.generate(),
      name,
      category,
      description: input.description,
      data: input.data,
      status: input.status,
    });

    await this.sourceRepository.save(source);
    await this.knowledgeCatalog.register(source);
    return source;
  }

  async getKnowledgeSource(knowledgeId: string): Promise<KnowledgeSource | null> {
    return this.sourceRepository.findById(knowledgeId.trim());
  }

  async listKnowledgeSources(): Promise<ListKnowledgeSourcesResult> {
    const sources = Object.freeze(
      [...(await this.sourceRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ sources, total: sources.length });
  }

  async updateKnowledgeSource(input: UpdateKnowledgeSourceInput): Promise<KnowledgeSource> {
    const knowledgeId = input.knowledgeId.trim();
    const existing = await this.sourceRepository.findById(knowledgeId);
    if (!existing) {
      throw new Error(`Knowledge source not found: ${knowledgeId}`);
    }

    const validation = await this.knowledgeValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const nextName = input.name?.trim() ?? existing.name;
    const nextCategory = input.category?.trim() ?? existing.category;

    if (nextName !== existing.name && (await this.sourceRepository.findByName(nextName))) {
      throw new Error(`Knowledge source already exists: ${nextName}`);
    }

    const updated = createKnowledgeSource({
      knowledgeId: existing.knowledgeId,
      name: nextName,
      category: nextCategory,
      description: input.description ?? existing.description,
      data: input.data ?? existing.data,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.sourceRepository.save(updated);
    await this.knowledgeCatalog.register(updated);
    return updated;
  }

  async deleteKnowledgeSource(knowledgeId: string): Promise<DeleteKnowledgeSourceResult> {
    const normalizedKnowledgeId = knowledgeId.trim();
    const deleted = await this.sourceRepository.delete(normalizedKnowledgeId);
    if (deleted) {
      await this.knowledgeCatalog.remove(normalizedKnowledgeId);
    }
    return Object.freeze({ knowledgeId: normalizedKnowledgeId, deleted });
  }

  async findKnowledgeSourceByName(name: string): Promise<FindKnowledgeSourceByNameResult> {
    const source = await this.sourceRepository.findByName(name.trim());
    return Object.freeze({ source });
  }

  async listKnowledgeSourcesByCategory(
    category: string,
  ): Promise<ListKnowledgeSourcesByCategoryResult> {
    const normalizedCategory = category.trim();
    const sources = Object.freeze(
      [...(await this.sourceRepository.findByCategory(normalizedCategory))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      sources,
      total: sources.length,
      category: normalizedCategory,
    });
  }

  async getKnowledgeRegistryStatistics(): Promise<KnowledgeRegistryStatistics> {
    const sources = await this.sourceRepository.findAll();
    const activeSources = sources.filter((source) => source.status === "active").length;
    const categories = Object.freeze([
      ...new Set(sources.map((source) => source.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalSources: sources.length,
      activeSources,
      categories,
    });
  }

  async serializeKnowledge(data: unknown): Promise<string> {
    return this.knowledgeSerializer.serialize(data);
  }

  async deserializeKnowledge(serialized: string): Promise<unknown> {
    return this.knowledgeSerializer.deserialize(serialized);
  }
}
