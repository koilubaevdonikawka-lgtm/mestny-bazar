/**
 * AI Taxonomy Registry — unified registry for AI taxonomies.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ITaxonomyCatalog } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-catalog.contract";
import type { ITaxonomyRepository } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-repository.contract";
import type { ITaxonomySerializer } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-serializer.contract";
import type { ITaxonomyStatisticsProvider } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-statistics-provider.contract";
import type { ITaxonomyValidator } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-validator.contract";
import {
  createTaxonomy,
  type DeleteTaxonomyResult,
  type FindTaxonomyByNameResult,
  type ListTaxonomiesByCategoryResult,
  type ListTaxonomiesResult,
  type RegisterTaxonomyInput,
  type Taxonomy,
  type TaxonomyRegistryStatistics,
  type UpdateTaxonomyInput,
} from "@server/application/ai-taxonomy-registry/models/taxonomy.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiTaxonomyRegistryService {
  constructor(
    private readonly taxonomyRepository: ITaxonomyRepository,
    private readonly taxonomyCatalog: ITaxonomyCatalog,
    private readonly taxonomyValidator: ITaxonomyValidator,
    private readonly taxonomySerializer: ITaxonomySerializer,
    private readonly statisticsProvider: ITaxonomyStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerTaxonomy(input: RegisterTaxonomyInput): Promise<Taxonomy> {
    const validation = await this.taxonomyValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.taxonomyRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Taxonomy already exists with name: ${input.name.trim()}`);
    }

    const taxonomy = createTaxonomy({
      taxonomyId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.taxonomyRepository.save(taxonomy);
    await this.taxonomyCatalog.register(taxonomy);
    return taxonomy;
  }

  async getTaxonomy(taxonomyId: string): Promise<Taxonomy | null> {
    return this.taxonomyRepository.findById(taxonomyId.trim());
  }

  async listTaxonomies(): Promise<ListTaxonomiesResult> {
    const taxonomies = Object.freeze(
      [...(await this.taxonomyRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ taxonomies, total: taxonomies.length });
  }

  async updateTaxonomy(input: UpdateTaxonomyInput): Promise<Taxonomy> {
    const taxonomyId = input.taxonomyId.trim();
    const existing = await this.taxonomyRepository.findById(taxonomyId);
    if (!existing) {
      throw new Error(`Taxonomy not found: ${taxonomyId}`);
    }

    const validation = await this.taxonomyValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.taxonomyRepository.findByName(input.name.trim());
      if (duplicate && duplicate.taxonomyId !== existing.taxonomyId) {
        throw new Error(`Taxonomy already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createTaxonomy({
      taxonomyId: existing.taxonomyId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.taxonomyRepository.save(updated);
    await this.taxonomyCatalog.register(updated);
    return updated;
  }

  async deleteTaxonomy(taxonomyId: string): Promise<DeleteTaxonomyResult> {
    const normalizedTaxonomyId = taxonomyId.trim();
    const deleted = await this.taxonomyRepository.delete(normalizedTaxonomyId);
    if (deleted) {
      await this.taxonomyCatalog.remove(normalizedTaxonomyId);
    }
    return Object.freeze({ taxonomyId: normalizedTaxonomyId, deleted });
  }

  async findTaxonomyByName(name: string): Promise<FindTaxonomyByNameResult> {
    const normalizedName = name.trim();
    const taxonomy = await this.taxonomyRepository.findByName(normalizedName);
    return Object.freeze({ taxonomy });
  }

  async listTaxonomiesByCategory(category: string): Promise<ListTaxonomiesByCategoryResult> {
    const normalizedCategory = category.trim();
    const taxonomies = Object.freeze(
      [...(await this.taxonomyRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      taxonomies,
      total: taxonomies.length,
      category: normalizedCategory,
    });
  }

  async getTaxonomyRegistryStatistics(): Promise<TaxonomyRegistryStatistics> {
    const taxonomies = await this.taxonomyRepository.findAll();
    const activeTaxonomies = taxonomies.filter((taxonomy) => taxonomy.status === "active").length;
    const categories = Object.freeze([
      ...new Set(taxonomies.map((taxonomy) => taxonomy.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalTaxonomies: taxonomies.length,
      activeTaxonomies,
      categories,
    });
  }

  async serializeTaxonomy(taxonomy: Taxonomy): Promise<string> {
    return this.taxonomySerializer.serialize(taxonomy);
  }

  async deserializeTaxonomy(serialized: string): Promise<Taxonomy> {
    return this.taxonomySerializer.deserialize(serialized);
  }
}
