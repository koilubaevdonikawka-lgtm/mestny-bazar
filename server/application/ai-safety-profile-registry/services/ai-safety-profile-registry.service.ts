/**
 * AI Safety Profile Registry — unified registry for AI safety profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISafetyProfileCatalog } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-catalog.contract";
import type { ISafetyProfileRepository } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-repository.contract";
import type { ISafetyProfileSerializer } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-serializer.contract";
import type { ISafetyProfileStatisticsProvider } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-statistics-provider.contract";
import type { ISafetyProfileValidator } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-validator.contract";
import {
  createSafetyProfile,
  type DeleteSafetyProfileResult,
  type FindSafetyProfileByNameResult,
  type SafetyProfile,
  type SafetyProfileRegistryStatistics,
  type ListSafetyProfilesByCategoryResult,
  type ListSafetyProfilesResult,
  type RegisterSafetyProfileInput,
  type UpdateSafetyProfileInput,
} from "@server/application/ai-safety-profile-registry/models/safety-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiSafetyProfileRegistryService {
  constructor(
    private readonly safetyProfileRepository: ISafetyProfileRepository,
    private readonly safetyProfileCatalog: ISafetyProfileCatalog,
    private readonly safetyProfileValidator: ISafetyProfileValidator,
    private readonly safetyProfileSerializer: ISafetyProfileSerializer,
    private readonly statisticsProvider: ISafetyProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSafetyProfile(input: RegisterSafetyProfileInput): Promise<SafetyProfile> {
    const validation = await this.safetyProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.safetyProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Safety profile already exists with name: ${input.name.trim()}`);
    }

    const safetyProfile = createSafetyProfile({
      safetyProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.safetyProfileRepository.save(safetyProfile);
    await this.safetyProfileCatalog.register(safetyProfile);
    return safetyProfile;
  }

  async getSafetyProfile(safetyProfileId: string): Promise<SafetyProfile | null> {
    return this.safetyProfileRepository.findById(safetyProfileId.trim());
  }

  async listSafetyProfiles(): Promise<ListSafetyProfilesResult> {
    const safetyProfiles = Object.freeze(
      [...(await this.safetyProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ safetyProfiles, total: safetyProfiles.length });
  }

  async updateSafetyProfile(input: UpdateSafetyProfileInput): Promise<SafetyProfile> {
    const safetyProfileId = input.safetyProfileId.trim();
    const existing = await this.safetyProfileRepository.findById(safetyProfileId);
    if (!existing) {
      throw new Error(`Safety profile not found: ${safetyProfileId}`);
    }

    const validation = await this.safetyProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.safetyProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.safetyProfileId !== existing.safetyProfileId) {
        throw new Error(`Safety profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createSafetyProfile({
      safetyProfileId: existing.safetyProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.safetyProfileRepository.save(updated);
    await this.safetyProfileCatalog.register(updated);
    return updated;
  }

  async deleteSafetyProfile(safetyProfileId: string): Promise<DeleteSafetyProfileResult> {
    const normalizedSafetyProfileId = safetyProfileId.trim();
    const deleted = await this.safetyProfileRepository.delete(normalizedSafetyProfileId);
    if (deleted) {
      await this.safetyProfileCatalog.remove(normalizedSafetyProfileId);
    }
    return Object.freeze({ safetyProfileId: normalizedSafetyProfileId, deleted });
  }

  async findSafetyProfileByName(name: string): Promise<FindSafetyProfileByNameResult> {
    const normalizedName = name.trim();
    const safetyProfile = await this.safetyProfileRepository.findByName(normalizedName);
    return Object.freeze({ safetyProfile });
  }

  async listSafetyProfilesByCategory(category: string): Promise<ListSafetyProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const safetyProfiles = Object.freeze(
      [...(await this.safetyProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      safetyProfiles,
      total: safetyProfiles.length,
      category: normalizedCategory,
    });
  }

  async getSafetyProfileRegistryStatistics(): Promise<SafetyProfileRegistryStatistics> {
    const safetyProfiles = await this.safetyProfileRepository.findAll();
    const activeSafetyProfiles = safetyProfiles.filter(
      (safetyProfile) => safetyProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(safetyProfiles.map((safetyProfile) => safetyProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalSafetyProfiles: safetyProfiles.length,
      activeSafetyProfiles,
      categories,
    });
  }

  async serializeSafetyProfile(safetyProfile: SafetyProfile): Promise<string> {
    return this.safetyProfileSerializer.serialize(safetyProfile);
  }

  async deserializeSafetyProfile(serialized: string): Promise<SafetyProfile> {
    return this.safetyProfileSerializer.deserialize(serialized);
  }
}
