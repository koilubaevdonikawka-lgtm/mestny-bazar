/**
 * AI Fairness Profile Registry — unified registry for AI fairness profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IFairnessProfileCatalog } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-catalog.contract";
import type { IFairnessProfileRepository } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-repository.contract";
import type { IFairnessProfileSerializer } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-serializer.contract";
import type { IFairnessProfileStatisticsProvider } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-statistics-provider.contract";
import type { IFairnessProfileValidator } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-validator.contract";
import {
  createFairnessProfile,
  type DeleteFairnessProfileResult,
  type FindFairnessProfileByNameResult,
  type FairnessProfile,
  type FairnessProfileRegistryStatistics,
  type ListFairnessProfilesByCategoryResult,
  type ListFairnessProfilesResult,
  type RegisterFairnessProfileInput,
  type UpdateFairnessProfileInput,
} from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiFairnessProfileRegistryService {
  constructor(
    private readonly fairnessProfileRepository: IFairnessProfileRepository,
    private readonly fairnessProfileCatalog: IFairnessProfileCatalog,
    private readonly fairnessProfileValidator: IFairnessProfileValidator,
    private readonly fairnessProfileSerializer: IFairnessProfileSerializer,
    private readonly statisticsProvider: IFairnessProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerFairnessProfile(input: RegisterFairnessProfileInput): Promise<FairnessProfile> {
    const validation = await this.fairnessProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.fairnessProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Fairness profile already exists with name: ${input.name.trim()}`);
    }

    const fairnessProfile = createFairnessProfile({
      fairnessProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.fairnessProfileRepository.save(fairnessProfile);
    await this.fairnessProfileCatalog.register(fairnessProfile);
    return fairnessProfile;
  }

  async getFairnessProfile(fairnessProfileId: string): Promise<FairnessProfile | null> {
    return this.fairnessProfileRepository.findById(fairnessProfileId.trim());
  }

  async listFairnessProfiles(): Promise<ListFairnessProfilesResult> {
    const fairnessProfiles = Object.freeze(
      [...(await this.fairnessProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ fairnessProfiles, total: fairnessProfiles.length });
  }

  async updateFairnessProfile(input: UpdateFairnessProfileInput): Promise<FairnessProfile> {
    const fairnessProfileId = input.fairnessProfileId.trim();
    const existing = await this.fairnessProfileRepository.findById(fairnessProfileId);
    if (!existing) {
      throw new Error(`Fairness profile not found: ${fairnessProfileId}`);
    }

    const validation = await this.fairnessProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.fairnessProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.fairnessProfileId !== existing.fairnessProfileId) {
        throw new Error(`Fairness profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createFairnessProfile({
      fairnessProfileId: existing.fairnessProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.fairnessProfileRepository.save(updated);
    await this.fairnessProfileCatalog.register(updated);
    return updated;
  }

  async deleteFairnessProfile(fairnessProfileId: string): Promise<DeleteFairnessProfileResult> {
    const normalizedFairnessProfileId = fairnessProfileId.trim();
    const deleted = await this.fairnessProfileRepository.delete(normalizedFairnessProfileId);
    if (deleted) {
      await this.fairnessProfileCatalog.remove(normalizedFairnessProfileId);
    }
    return Object.freeze({ fairnessProfileId: normalizedFairnessProfileId, deleted });
  }

  async findFairnessProfileByName(name: string): Promise<FindFairnessProfileByNameResult> {
    const normalizedName = name.trim();
    const fairnessProfile = await this.fairnessProfileRepository.findByName(normalizedName);
    return Object.freeze({ fairnessProfile });
  }

  async listFairnessProfilesByCategory(category: string): Promise<ListFairnessProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const fairnessProfiles = Object.freeze(
      [...(await this.fairnessProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      fairnessProfiles,
      total: fairnessProfiles.length,
      category: normalizedCategory,
    });
  }

  async getFairnessProfileRegistryStatistics(): Promise<FairnessProfileRegistryStatistics> {
    const fairnessProfiles = await this.fairnessProfileRepository.findAll();
    const activeFairnessProfiles = fairnessProfiles.filter(
      (fairnessProfile) => fairnessProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(fairnessProfiles.map((fairnessProfile) => fairnessProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalFairnessProfiles: fairnessProfiles.length,
      activeFairnessProfiles,
      categories,
    });
  }

  async serializeFairnessProfile(fairnessProfile: FairnessProfile): Promise<string> {
    return this.fairnessProfileSerializer.serialize(fairnessProfile);
  }

  async deserializeFairnessProfile(serialized: string): Promise<FairnessProfile> {
    return this.fairnessProfileSerializer.deserialize(serialized);
  }
}
