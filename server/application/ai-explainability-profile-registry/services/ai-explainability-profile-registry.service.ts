/**
 * AI Explainability Profile Registry — unified registry for AI explainability profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IExplainabilityProfileCatalog } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-catalog.contract";
import type { IExplainabilityProfileRepository } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-repository.contract";
import type { IExplainabilityProfileSerializer } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-serializer.contract";
import type { IExplainabilityProfileStatisticsProvider } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-statistics-provider.contract";
import type { IExplainabilityProfileValidator } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-validator.contract";
import {
  createExplainabilityProfile,
  type DeleteExplainabilityProfileResult,
  type FindExplainabilityProfileByNameResult,
  type ExplainabilityProfile,
  type ExplainabilityProfileRegistryStatistics,
  type ListExplainabilityProfilesByCategoryResult,
  type ListExplainabilityProfilesResult,
  type RegisterExplainabilityProfileInput,
  type UpdateExplainabilityProfileInput,
} from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiExplainabilityProfileRegistryService {
  constructor(
    private readonly explainabilityProfileRepository: IExplainabilityProfileRepository,
    private readonly explainabilityProfileCatalog: IExplainabilityProfileCatalog,
    private readonly explainabilityProfileValidator: IExplainabilityProfileValidator,
    private readonly explainabilityProfileSerializer: IExplainabilityProfileSerializer,
    private readonly statisticsProvider: IExplainabilityProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerExplainabilityProfile(input: RegisterExplainabilityProfileInput): Promise<ExplainabilityProfile> {
    const validation = await this.explainabilityProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.explainabilityProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Explainability profile already exists with name: ${input.name.trim()}`);
    }

    const explainabilityProfile = createExplainabilityProfile({
      explainabilityProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.explainabilityProfileRepository.save(explainabilityProfile);
    await this.explainabilityProfileCatalog.register(explainabilityProfile);
    return explainabilityProfile;
  }

  async getExplainabilityProfile(explainabilityProfileId: string): Promise<ExplainabilityProfile | null> {
    return this.explainabilityProfileRepository.findById(explainabilityProfileId.trim());
  }

  async listExplainabilityProfiles(): Promise<ListExplainabilityProfilesResult> {
    const explainabilityProfiles = Object.freeze(
      [...(await this.explainabilityProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ explainabilityProfiles, total: explainabilityProfiles.length });
  }

  async updateExplainabilityProfile(input: UpdateExplainabilityProfileInput): Promise<ExplainabilityProfile> {
    const explainabilityProfileId = input.explainabilityProfileId.trim();
    const existing = await this.explainabilityProfileRepository.findById(explainabilityProfileId);
    if (!existing) {
      throw new Error(`Explainability profile not found: ${explainabilityProfileId}`);
    }

    const validation = await this.explainabilityProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.explainabilityProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.explainabilityProfileId !== existing.explainabilityProfileId) {
        throw new Error(`Explainability profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createExplainabilityProfile({
      explainabilityProfileId: existing.explainabilityProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.explainabilityProfileRepository.save(updated);
    await this.explainabilityProfileCatalog.register(updated);
    return updated;
  }

  async deleteExplainabilityProfile(explainabilityProfileId: string): Promise<DeleteExplainabilityProfileResult> {
    const normalizedExplainabilityProfileId = explainabilityProfileId.trim();
    const deleted = await this.explainabilityProfileRepository.delete(normalizedExplainabilityProfileId);
    if (deleted) {
      await this.explainabilityProfileCatalog.remove(normalizedExplainabilityProfileId);
    }
    return Object.freeze({ explainabilityProfileId: normalizedExplainabilityProfileId, deleted });
  }

  async findExplainabilityProfileByName(name: string): Promise<FindExplainabilityProfileByNameResult> {
    const normalizedName = name.trim();
    const explainabilityProfile = await this.explainabilityProfileRepository.findByName(normalizedName);
    return Object.freeze({ explainabilityProfile });
  }

  async listExplainabilityProfilesByCategory(category: string): Promise<ListExplainabilityProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const explainabilityProfiles = Object.freeze(
      [...(await this.explainabilityProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      explainabilityProfiles,
      total: explainabilityProfiles.length,
      category: normalizedCategory,
    });
  }

  async getExplainabilityProfileRegistryStatistics(): Promise<ExplainabilityProfileRegistryStatistics> {
    const explainabilityProfiles = await this.explainabilityProfileRepository.findAll();
    const activeExplainabilityProfiles = explainabilityProfiles.filter(
      (explainabilityProfile) => explainabilityProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(explainabilityProfiles.map((explainabilityProfile) => explainabilityProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalExplainabilityProfiles: explainabilityProfiles.length,
      activeExplainabilityProfiles,
      categories,
    });
  }

  async serializeExplainabilityProfile(explainabilityProfile: ExplainabilityProfile): Promise<string> {
    return this.explainabilityProfileSerializer.serialize(explainabilityProfile);
  }

  async deserializeExplainabilityProfile(serialized: string): Promise<ExplainabilityProfile> {
    return this.explainabilityProfileSerializer.deserialize(serialized);
  }
}
