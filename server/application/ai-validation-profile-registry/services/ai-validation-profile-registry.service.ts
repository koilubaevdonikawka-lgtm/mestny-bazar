/**
 * AI Validation Profile Registry — unified registry for AI validation profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IValidationProfileCatalog } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-catalog.contract";
import type { IValidationProfileRepository } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-repository.contract";
import type { IValidationProfileSerializer } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-serializer.contract";
import type { IValidationProfileStatisticsProvider } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-statistics-provider.contract";
import type { IValidationProfileValidator } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-validator.contract";
import {
  createValidationProfile,
  type DeleteValidationProfileResult,
  type FindValidationProfileByNameResult,
  type ListValidationProfilesByCategoryResult,
  type ListValidationProfilesResult,
  type RegisterValidationProfileInput,
  type ValidationProfile,
  type ValidationProfileRegistryStatistics,
  type UpdateValidationProfileInput,
} from "@server/application/ai-validation-profile-registry/models/validation-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiValidationProfileRegistryService {
  constructor(
    private readonly validationProfileRepository: IValidationProfileRepository,
    private readonly validationProfileCatalog: IValidationProfileCatalog,
    private readonly validationProfileValidator: IValidationProfileValidator,
    private readonly validationProfileSerializer: IValidationProfileSerializer,
    private readonly statisticsProvider: IValidationProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerValidationProfile(input: RegisterValidationProfileInput): Promise<ValidationProfile> {
    const validation = await this.validationProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.validationProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Validation profile already exists with name: ${input.name.trim()}`);
    }

    const validationProfile = createValidationProfile({
      validationProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.validationProfileRepository.save(validationProfile);
    await this.validationProfileCatalog.register(validationProfile);
    return validationProfile;
  }

  async getValidationProfile(validationProfileId: string): Promise<ValidationProfile | null> {
    return this.validationProfileRepository.findById(validationProfileId.trim());
  }

  async listValidationProfiles(): Promise<ListValidationProfilesResult> {
    const validationProfiles = Object.freeze(
      [...(await this.validationProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ validationProfiles, total: validationProfiles.length });
  }

  async updateValidationProfile(input: UpdateValidationProfileInput): Promise<ValidationProfile> {
    const validationProfileId = input.validationProfileId.trim();
    const existing = await this.validationProfileRepository.findById(validationProfileId);
    if (!existing) {
      throw new Error(`Validation profile not found: ${validationProfileId}`);
    }

    const validation = await this.validationProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.validationProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.validationProfileId !== existing.validationProfileId) {
        throw new Error(`Validation profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createValidationProfile({
      validationProfileId: existing.validationProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.validationProfileRepository.save(updated);
    await this.validationProfileCatalog.register(updated);
    return updated;
  }

  async deleteValidationProfile(validationProfileId: string): Promise<DeleteValidationProfileResult> {
    const normalizedValidationProfileId = validationProfileId.trim();
    const deleted = await this.validationProfileRepository.delete(normalizedValidationProfileId);
    if (deleted) {
      await this.validationProfileCatalog.remove(normalizedValidationProfileId);
    }
    return Object.freeze({ validationProfileId: normalizedValidationProfileId, deleted });
  }

  async findValidationProfileByName(name: string): Promise<FindValidationProfileByNameResult> {
    const normalizedName = name.trim();
    const validationProfile = await this.validationProfileRepository.findByName(normalizedName);
    return Object.freeze({ validationProfile });
  }

  async listValidationProfilesByCategory(category: string): Promise<ListValidationProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const validationProfiles = Object.freeze(
      [...(await this.validationProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      validationProfiles,
      total: validationProfiles.length,
      category: normalizedCategory,
    });
  }

  async getValidationProfileRegistryStatistics(): Promise<ValidationProfileRegistryStatistics> {
    const validationProfiles = await this.validationProfileRepository.findAll();
    const activeValidationProfiles = validationProfiles.filter(
      (validationProfile) => validationProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(validationProfiles.map((validationProfile) => validationProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalValidationProfiles: validationProfiles.length,
      activeValidationProfiles,
      categories,
    });
  }

  async serializeValidationProfile(validationProfile: ValidationProfile): Promise<string> {
    return this.validationProfileSerializer.serialize(validationProfile);
  }

  async deserializeValidationProfile(serialized: string): Promise<ValidationProfile> {
    return this.validationProfileSerializer.deserialize(serialized);
  }
}
