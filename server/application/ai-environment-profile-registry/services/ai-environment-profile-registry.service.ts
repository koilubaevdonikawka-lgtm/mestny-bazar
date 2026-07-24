/**
 * AI Environment Profile Registry — unified registry for AI environment profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IEnvironmentProfileCatalog } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-catalog.contract";
import type { IEnvironmentProfileRepository } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-repository.contract";
import type { IEnvironmentProfileSerializer } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-serializer.contract";
import type { IEnvironmentProfileStatisticsProvider } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-statistics-provider.contract";
import type { IEnvironmentProfileValidator } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-validator.contract";
import {
  createEnvironmentProfile,
  type DeleteEnvironmentProfileResult,
  type EnvironmentProfile,
  type EnvironmentProfileRegistryStatistics,
  type FindEnvironmentProfileByNameResult,
  type ListEnvironmentProfilesByCategoryResult,
  type ListEnvironmentProfilesResult,
  type RegisterEnvironmentProfileInput,
  type UpdateEnvironmentProfileInput,
} from "@server/application/ai-environment-profile-registry/models/environment-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiEnvironmentProfileRegistryService {
  constructor(
    private readonly environmentProfileRepository: IEnvironmentProfileRepository,
    private readonly environmentProfileCatalog: IEnvironmentProfileCatalog,
    private readonly environmentProfileValidator: IEnvironmentProfileValidator,
    private readonly environmentProfileSerializer: IEnvironmentProfileSerializer,
    private readonly statisticsProvider: IEnvironmentProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerEnvironmentProfile(input: RegisterEnvironmentProfileInput): Promise<EnvironmentProfile> {
    const validation = await this.environmentProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.environmentProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Environment profile already exists with name: ${input.name.trim()}`);
    }

    const environmentProfile = createEnvironmentProfile({
      environmentProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.environmentProfileRepository.save(environmentProfile);
    await this.environmentProfileCatalog.register(environmentProfile);
    return environmentProfile;
  }

  async getEnvironmentProfile(environmentProfileId: string): Promise<EnvironmentProfile | null> {
    return this.environmentProfileRepository.findById(environmentProfileId.trim());
  }

  async listEnvironmentProfiles(): Promise<ListEnvironmentProfilesResult> {
    const environmentProfiles = Object.freeze(
      [...(await this.environmentProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ environmentProfiles, total: environmentProfiles.length });
  }

  async updateEnvironmentProfile(input: UpdateEnvironmentProfileInput): Promise<EnvironmentProfile> {
    const environmentProfileId = input.environmentProfileId.trim();
    const existing = await this.environmentProfileRepository.findById(environmentProfileId);
    if (!existing) {
      throw new Error(`Environment profile not found: ${environmentProfileId}`);
    }

    const validation = await this.environmentProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.environmentProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.environmentProfileId !== existing.environmentProfileId) {
        throw new Error(`Environment profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createEnvironmentProfile({
      environmentProfileId: existing.environmentProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.environmentProfileRepository.save(updated);
    await this.environmentProfileCatalog.register(updated);
    return updated;
  }

  async deleteEnvironmentProfile(environmentProfileId: string): Promise<DeleteEnvironmentProfileResult> {
    const normalizedEnvironmentProfileId = environmentProfileId.trim();
    const deleted = await this.environmentProfileRepository.delete(normalizedEnvironmentProfileId);
    if (deleted) {
      await this.environmentProfileCatalog.remove(normalizedEnvironmentProfileId);
    }
    return Object.freeze({ environmentProfileId: normalizedEnvironmentProfileId, deleted });
  }

  async findEnvironmentProfileByName(name: string): Promise<FindEnvironmentProfileByNameResult> {
    const normalizedName = name.trim();
    const environmentProfile = await this.environmentProfileRepository.findByName(normalizedName);
    return Object.freeze({ environmentProfile });
  }

  async listEnvironmentProfilesByCategory(
    category: string,
  ): Promise<ListEnvironmentProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const environmentProfiles = Object.freeze(
      [...(await this.environmentProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      environmentProfiles,
      total: environmentProfiles.length,
      category: normalizedCategory,
    });
  }

  async getEnvironmentProfileRegistryStatistics(): Promise<EnvironmentProfileRegistryStatistics> {
    const environmentProfiles = await this.environmentProfileRepository.findAll();
    const activeEnvironmentProfiles = environmentProfiles.filter(
      (environmentProfile) => environmentProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(environmentProfiles.map((environmentProfile) => environmentProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalEnvironmentProfiles: environmentProfiles.length,
      activeEnvironmentProfiles,
      categories,
    });
  }

  async serializeEnvironmentProfile(environmentProfile: EnvironmentProfile): Promise<string> {
    return this.environmentProfileSerializer.serialize(environmentProfile);
  }

  async deserializeEnvironmentProfile(serialized: string): Promise<EnvironmentProfile> {
    return this.environmentProfileSerializer.deserialize(serialized);
  }
}
