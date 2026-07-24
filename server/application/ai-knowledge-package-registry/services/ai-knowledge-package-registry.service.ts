/**
 * AI Knowledge Package Registry — unified registry for AI knowledge packages.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IKnowledgePackageCatalog } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-catalog.contract";
import type { IKnowledgePackageRepository } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-repository.contract";
import type { IKnowledgePackageSerializer } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-serializer.contract";
import type { IKnowledgePackageStatisticsProvider } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-statistics-provider.contract";
import type { IKnowledgePackageValidator } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-validator.contract";
import {
  createKnowledgePackage,
  type DeleteKnowledgePackageResult,
  type FindKnowledgePackageByNameResult,
  type ListKnowledgePackagesByCategoryResult,
  type ListKnowledgePackagesResult,
  type RegisterKnowledgePackageInput,
  type KnowledgePackage,
  type KnowledgePackageRegistryStatistics,
  type UpdateKnowledgePackageInput,
} from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiKnowledgePackageRegistryService {
  constructor(
    private readonly knowledgePackageRepository: IKnowledgePackageRepository,
    private readonly knowledgePackageCatalog: IKnowledgePackageCatalog,
    private readonly knowledgePackageValidator: IKnowledgePackageValidator,
    private readonly knowledgePackageSerializer: IKnowledgePackageSerializer,
    private readonly statisticsProvider: IKnowledgePackageStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerKnowledgePackage(input: RegisterKnowledgePackageInput): Promise<KnowledgePackage> {
    const validation = await this.knowledgePackageValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.knowledgePackageRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Knowledge package already exists with name: ${input.name.trim()}`);
    }

    const knowledgePackage = createKnowledgePackage({
      knowledgePackageId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.knowledgePackageRepository.save(knowledgePackage);
    await this.knowledgePackageCatalog.register(knowledgePackage);
    return knowledgePackage;
  }

  async getKnowledgePackage(knowledgePackageId: string): Promise<KnowledgePackage | null> {
    return this.knowledgePackageRepository.findById(knowledgePackageId.trim());
  }

  async listKnowledgePackages(): Promise<ListKnowledgePackagesResult> {
    const knowledgePackages = Object.freeze(
      [...(await this.knowledgePackageRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ knowledgePackages, total: knowledgePackages.length });
  }

  async updateKnowledgePackage(input: UpdateKnowledgePackageInput): Promise<KnowledgePackage> {
    const knowledgePackageId = input.knowledgePackageId.trim();
    const existing = await this.knowledgePackageRepository.findById(knowledgePackageId);
    if (!existing) {
      throw new Error(`Knowledge package not found: ${knowledgePackageId}`);
    }

    const validation = await this.knowledgePackageValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.knowledgePackageRepository.findByName(input.name.trim());
      if (duplicate && duplicate.knowledgePackageId !== existing.knowledgePackageId) {
        throw new Error(`Knowledge package already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createKnowledgePackage({
      knowledgePackageId: existing.knowledgePackageId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.knowledgePackageRepository.save(updated);
    await this.knowledgePackageCatalog.register(updated);
    return updated;
  }

  async deleteKnowledgePackage(knowledgePackageId: string): Promise<DeleteKnowledgePackageResult> {
    const normalizedKnowledgePackageId = knowledgePackageId.trim();
    const deleted = await this.knowledgePackageRepository.delete(normalizedKnowledgePackageId);
    if (deleted) {
      await this.knowledgePackageCatalog.remove(normalizedKnowledgePackageId);
    }
    return Object.freeze({ knowledgePackageId: normalizedKnowledgePackageId, deleted });
  }

  async findKnowledgePackageByName(name: string): Promise<FindKnowledgePackageByNameResult> {
    const normalizedName = name.trim();
    const knowledgePackage = await this.knowledgePackageRepository.findByName(normalizedName);
    return Object.freeze({ knowledgePackage });
  }

  async listKnowledgePackagesByCategory(
    category: string,
  ): Promise<ListKnowledgePackagesByCategoryResult> {
    const normalizedCategory = category.trim();
    const knowledgePackages = Object.freeze(
      [...(await this.knowledgePackageRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      knowledgePackages,
      total: knowledgePackages.length,
      category: normalizedCategory,
    });
  }

  async getKnowledgePackageRegistryStatistics(): Promise<KnowledgePackageRegistryStatistics> {
    const knowledgePackages = await this.knowledgePackageRepository.findAll();
    const activeKnowledgePackages = knowledgePackages.filter(
      (knowledgePackage) => knowledgePackage.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(knowledgePackages.map((knowledgePackage) => knowledgePackage.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalKnowledgePackages: knowledgePackages.length,
      activeKnowledgePackages,
      categories,
    });
  }

  async serializeKnowledgePackage(knowledgePackage: KnowledgePackage): Promise<string> {
    return this.knowledgePackageSerializer.serialize(knowledgePackage);
  }

  async deserializeKnowledgePackage(serialized: string): Promise<KnowledgePackage> {
    return this.knowledgePackageSerializer.deserialize(serialized);
  }
}
