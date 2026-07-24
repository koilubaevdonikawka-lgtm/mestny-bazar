/**
 * AI Knowledge Source Registry — unified registry for AI knowledge sources.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IKnowledgeSourceCatalog } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-catalog.contract";
import type { IKnowledgeSourceRepository } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-repository.contract";
import type { IKnowledgeSourceSerializer } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-serializer.contract";
import type { IKnowledgeSourceStatisticsProvider } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-statistics-provider.contract";
import type { IKnowledgeSourceValidator } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-validator.contract";
import {
  createKnowledgeSource,
  type DeleteKnowledgeSourceResult,
  type FindKnowledgeSourceByNameResult,
  type ListKnowledgeSourcesByCategoryResult,
  type ListKnowledgeSourcesResult,
  type RegisterKnowledgeSourceInput,
  type KnowledgeSource,
  type KnowledgeSourceRegistryStatistics,
  type UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiKnowledgeSourceRegistryService {
  constructor(
    private readonly knowledgeSourceRepository: IKnowledgeSourceRepository,
    private readonly knowledgeSourceCatalog: IKnowledgeSourceCatalog,
    private readonly knowledgeSourceValidator: IKnowledgeSourceValidator,
    private readonly knowledgeSourceSerializer: IKnowledgeSourceSerializer,
    private readonly statisticsProvider: IKnowledgeSourceStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerKnowledgeSource(input: RegisterKnowledgeSourceInput): Promise<KnowledgeSource> {
    const validation = await this.knowledgeSourceValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.knowledgeSourceRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Knowledge source already exists with name: ${input.name.trim()}`);
    }

    const knowledgeSource = createKnowledgeSource({
      knowledgeSourceId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.knowledgeSourceRepository.save(knowledgeSource);
    await this.knowledgeSourceCatalog.register(knowledgeSource);
    return knowledgeSource;
  }

  async getKnowledgeSource(knowledgeSourceId: string): Promise<KnowledgeSource | null> {
    return this.knowledgeSourceRepository.findById(knowledgeSourceId.trim());
  }

  async listKnowledgeSources(): Promise<ListKnowledgeSourcesResult> {
    const knowledgeSources = Object.freeze(
      [...(await this.knowledgeSourceRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ knowledgeSources, total: knowledgeSources.length });
  }

  async updateKnowledgeSource(input: UpdateKnowledgeSourceInput): Promise<KnowledgeSource> {
    const knowledgeSourceId = input.knowledgeSourceId.trim();
    const existing = await this.knowledgeSourceRepository.findById(knowledgeSourceId);
    if (!existing) {
      throw new Error(`Knowledge source not found: ${knowledgeSourceId}`);
    }

    const validation = await this.knowledgeSourceValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.knowledgeSourceRepository.findByName(input.name.trim());
      if (duplicate && duplicate.knowledgeSourceId !== existing.knowledgeSourceId) {
        throw new Error(`Knowledge source already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createKnowledgeSource({
      knowledgeSourceId: existing.knowledgeSourceId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.knowledgeSourceRepository.save(updated);
    await this.knowledgeSourceCatalog.register(updated);
    return updated;
  }

  async deleteKnowledgeSource(knowledgeSourceId: string): Promise<DeleteKnowledgeSourceResult> {
    const normalizedKnowledgeSourceId = knowledgeSourceId.trim();
    const deleted = await this.knowledgeSourceRepository.delete(normalizedKnowledgeSourceId);
    if (deleted) {
      await this.knowledgeSourceCatalog.remove(normalizedKnowledgeSourceId);
    }
    return Object.freeze({ knowledgeSourceId: normalizedKnowledgeSourceId, deleted });
  }

  async findKnowledgeSourceByName(name: string): Promise<FindKnowledgeSourceByNameResult> {
    const normalizedName = name.trim();
    const knowledgeSource = await this.knowledgeSourceRepository.findByName(normalizedName);
    return Object.freeze({ knowledgeSource });
  }

  async listKnowledgeSourcesByCategory(
    category: string,
  ): Promise<ListKnowledgeSourcesByCategoryResult> {
    const normalizedCategory = category.trim();
    const knowledgeSources = Object.freeze(
      [...(await this.knowledgeSourceRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      knowledgeSources,
      total: knowledgeSources.length,
      category: normalizedCategory,
    });
  }

  async getKnowledgeSourceRegistryStatistics(): Promise<KnowledgeSourceRegistryStatistics> {
    const knowledgeSources = await this.knowledgeSourceRepository.findAll();
    const activeKnowledgeSources = knowledgeSources.filter(
      (knowledgeSource) => knowledgeSource.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(knowledgeSources.map((knowledgeSource) => knowledgeSource.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalKnowledgeSources: knowledgeSources.length,
      activeKnowledgeSources,
      categories,
    });
  }

  async serializeKnowledgeSource(knowledgeSource: KnowledgeSource): Promise<string> {
    return this.knowledgeSourceSerializer.serialize(knowledgeSource);
  }

  async deserializeKnowledgeSource(serialized: string): Promise<KnowledgeSource> {
    return this.knowledgeSourceSerializer.deserialize(serialized);
  }
}
