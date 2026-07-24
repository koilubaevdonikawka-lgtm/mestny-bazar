/**
 * AI Privacy Profile Registry — unified registry for AI privacy profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IPrivacyProfileCatalog } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-catalog.contract";
import type { IPrivacyProfileRepository } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-repository.contract";
import type { IPrivacyProfileSerializer } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-serializer.contract";
import type { IPrivacyProfileStatisticsProvider } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-statistics-provider.contract";
import type { IPrivacyProfileValidator } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-validator.contract";
import {
  createPrivacyProfile,
  type DeletePrivacyProfileResult,
  type FindPrivacyProfileByNameResult,
  type PrivacyProfile,
  type PrivacyProfileRegistryStatistics,
  type ListPrivacyProfilesByCategoryResult,
  type ListPrivacyProfilesResult,
  type RegisterPrivacyProfileInput,
  type UpdatePrivacyProfileInput,
} from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiPrivacyProfileRegistryService {
  constructor(
    private readonly privacyProfileRepository: IPrivacyProfileRepository,
    private readonly privacyProfileCatalog: IPrivacyProfileCatalog,
    private readonly privacyProfileValidator: IPrivacyProfileValidator,
    private readonly privacyProfileSerializer: IPrivacyProfileSerializer,
    private readonly statisticsProvider: IPrivacyProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerPrivacyProfile(input: RegisterPrivacyProfileInput): Promise<PrivacyProfile> {
    const validation = await this.privacyProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.privacyProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Privacy profile already exists with name: ${input.name.trim()}`);
    }

    const privacyProfile = createPrivacyProfile({
      privacyProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.privacyProfileRepository.save(privacyProfile);
    await this.privacyProfileCatalog.register(privacyProfile);
    return privacyProfile;
  }

  async getPrivacyProfile(privacyProfileId: string): Promise<PrivacyProfile | null> {
    return this.privacyProfileRepository.findById(privacyProfileId.trim());
  }

  async listPrivacyProfiles(): Promise<ListPrivacyProfilesResult> {
    const privacyProfiles = Object.freeze(
      [...(await this.privacyProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ privacyProfiles, total: privacyProfiles.length });
  }

  async updatePrivacyProfile(input: UpdatePrivacyProfileInput): Promise<PrivacyProfile> {
    const privacyProfileId = input.privacyProfileId.trim();
    const existing = await this.privacyProfileRepository.findById(privacyProfileId);
    if (!existing) {
      throw new Error(`Privacy profile not found: ${privacyProfileId}`);
    }

    const validation = await this.privacyProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.privacyProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.privacyProfileId !== existing.privacyProfileId) {
        throw new Error(`Privacy profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createPrivacyProfile({
      privacyProfileId: existing.privacyProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.privacyProfileRepository.save(updated);
    await this.privacyProfileCatalog.register(updated);
    return updated;
  }

  async deletePrivacyProfile(privacyProfileId: string): Promise<DeletePrivacyProfileResult> {
    const normalizedPrivacyProfileId = privacyProfileId.trim();
    const deleted = await this.privacyProfileRepository.delete(normalizedPrivacyProfileId);
    if (deleted) {
      await this.privacyProfileCatalog.remove(normalizedPrivacyProfileId);
    }
    return Object.freeze({ privacyProfileId: normalizedPrivacyProfileId, deleted });
  }

  async findPrivacyProfileByName(name: string): Promise<FindPrivacyProfileByNameResult> {
    const normalizedName = name.trim();
    const privacyProfile = await this.privacyProfileRepository.findByName(normalizedName);
    return Object.freeze({ privacyProfile });
  }

  async listPrivacyProfilesByCategory(category: string): Promise<ListPrivacyProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const privacyProfiles = Object.freeze(
      [...(await this.privacyProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      privacyProfiles,
      total: privacyProfiles.length,
      category: normalizedCategory,
    });
  }

  async getPrivacyProfileRegistryStatistics(): Promise<PrivacyProfileRegistryStatistics> {
    const privacyProfiles = await this.privacyProfileRepository.findAll();
    const activePrivacyProfiles = privacyProfiles.filter(
      (privacyProfile) => privacyProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(privacyProfiles.map((privacyProfile) => privacyProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalPrivacyProfiles: privacyProfiles.length,
      activePrivacyProfiles,
      categories,
    });
  }

  async serializePrivacyProfile(privacyProfile: PrivacyProfile): Promise<string> {
    return this.privacyProfileSerializer.serialize(privacyProfile);
  }

  async deserializePrivacyProfile(serialized: string): Promise<PrivacyProfile> {
    return this.privacyProfileSerializer.deserialize(serialized);
  }
}
