/**
 * AI Catalog Metadata — unified registry of catalog metadata for AI.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ICatalogMetadataCatalog } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-catalog.contract";
import type { ICatalogMetadataRepository } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-repository.contract";
import type { ICatalogMetadataSerializer } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-serializer.contract";
import type { ICatalogMetadataStatisticsProvider } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-statistics-provider.contract";
import type { ICatalogMetadataValidator } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-validator.contract";
import {
  createCatalogMetadata,
  type CatalogMetadata,
  type CatalogMetadataStatistics,
  type DeleteCatalogMetadataResult,
  type FindCatalogMetadataByNameResult,
  type ListCatalogMetadataByCategoryResult,
  type ListCatalogMetadataResult,
  type RegisterCatalogMetadataInput,
  type UpdateCatalogMetadataInput,
} from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiCatalogMetadataService {
  constructor(
    private readonly metadataRepository: ICatalogMetadataRepository,
    private readonly metadataCatalog: ICatalogMetadataCatalog,
    private readonly metadataValidator: ICatalogMetadataValidator,
    private readonly metadataSerializer: ICatalogMetadataSerializer,
    private readonly statisticsProvider: ICatalogMetadataStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerCatalogMetadata(input: RegisterCatalogMetadataInput): Promise<CatalogMetadata> {
    const validation = await this.metadataValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const name = input.name.trim();
    const category = input.category.trim();

    if (await this.metadataRepository.findByName(name)) {
      throw new Error(`Catalog metadata already exists: ${name}`);
    }

    const entry = createCatalogMetadata({
      metadataId: this.idGenerator.generate(),
      name,
      category,
      description: input.description,
      data: input.data,
      status: input.status,
    });

    await this.metadataRepository.save(entry);
    await this.metadataCatalog.register(entry);
    return entry;
  }

  async getCatalogMetadata(metadataId: string): Promise<CatalogMetadata | null> {
    return this.metadataRepository.findById(metadataId.trim());
  }

  async listCatalogMetadata(): Promise<ListCatalogMetadataResult> {
    const entries = Object.freeze(
      [...(await this.metadataRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ entries, total: entries.length });
  }

  async updateCatalogMetadata(input: UpdateCatalogMetadataInput): Promise<CatalogMetadata> {
    const metadataId = input.metadataId.trim();
    const existing = await this.metadataRepository.findById(metadataId);
    if (!existing) {
      throw new Error(`Catalog metadata not found: ${metadataId}`);
    }

    const validation = await this.metadataValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const nextName = input.name?.trim() ?? existing.name;
    const nextCategory = input.category?.trim() ?? existing.category;

    if (nextName !== existing.name && (await this.metadataRepository.findByName(nextName))) {
      throw new Error(`Catalog metadata already exists: ${nextName}`);
    }

    const updated = createCatalogMetadata({
      metadataId: existing.metadataId,
      name: nextName,
      category: nextCategory,
      description: input.description ?? existing.description,
      data: input.data ?? existing.data,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.metadataRepository.save(updated);
    await this.metadataCatalog.register(updated);
    return updated;
  }

  async deleteCatalogMetadata(metadataId: string): Promise<DeleteCatalogMetadataResult> {
    const normalizedMetadataId = metadataId.trim();
    const deleted = await this.metadataRepository.delete(normalizedMetadataId);
    if (deleted) {
      await this.metadataCatalog.remove(normalizedMetadataId);
    }
    return Object.freeze({ metadataId: normalizedMetadataId, deleted });
  }

  async findCatalogMetadataByName(name: string): Promise<FindCatalogMetadataByNameResult> {
    const entry = await this.metadataRepository.findByName(name.trim());
    return Object.freeze({ entry });
  }

  async listCatalogMetadataByCategory(
    category: string,
  ): Promise<ListCatalogMetadataByCategoryResult> {
    const normalizedCategory = category.trim();
    const entries = Object.freeze(
      [...(await this.metadataRepository.findByCategory(normalizedCategory))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      entries,
      total: entries.length,
      category: normalizedCategory,
    });
  }

  async getCatalogMetadataStatistics(): Promise<CatalogMetadataStatistics> {
    const entries = await this.metadataRepository.findAll();
    const activeEntries = entries.filter((entry) => entry.status === "active").length;
    const categories = Object.freeze([
      ...new Set(entries.map((entry) => entry.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalEntries: entries.length,
      activeEntries,
      categories,
    });
  }

  async serializeMetadata(data: unknown): Promise<string> {
    return this.metadataSerializer.serialize(data);
  }

  async deserializeMetadata(serialized: string): Promise<unknown> {
    return this.metadataSerializer.deserialize(serialized);
  }
}
