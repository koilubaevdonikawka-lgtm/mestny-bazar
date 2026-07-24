/**
 * AI Resource Profile Registry — unified registry for AI resource profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IResourceProfileCatalog } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-catalog.contract";
import type { IResourceProfileRepository } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-repository.contract";
import type { IResourceProfileSerializer } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-serializer.contract";
import type { IResourceProfileStatisticsProvider } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-statistics-provider.contract";
import type { IResourceProfileValidator } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-validator.contract";
import {
  createResourceProfile,
  type DeleteResourceProfileResult,
  type FindResourceProfileByNameResult,
  type ResourceProfile,
  type ResourceProfileRegistryStatistics,
  type ListResourceProfilesByCategoryResult,
  type ListResourceProfilesResult,
  type RegisterResourceProfileInput,
  type UpdateResourceProfileInput,
} from "@server/application/ai-resource-profile-registry/models/resource-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiResourceProfileRegistryService {
  constructor(
    private readonly resourceProfileRepository: IResourceProfileRepository,
    private readonly resourceProfileCatalog: IResourceProfileCatalog,
    private readonly resourceProfileValidator: IResourceProfileValidator,
    private readonly resourceProfileSerializer: IResourceProfileSerializer,
    private readonly statisticsProvider: IResourceProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerResourceProfile(input: RegisterResourceProfileInput): Promise<ResourceProfile> {
    const validation = await this.resourceProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.resourceProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Resource profile already exists with name: ${input.name.trim()}`);
    }

    const resourceProfile = createResourceProfile({
      resourceProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.resourceProfileRepository.save(resourceProfile);
    await this.resourceProfileCatalog.register(resourceProfile);
    return resourceProfile;
  }

  async getResourceProfile(resourceProfileId: string): Promise<ResourceProfile | null> {
    return this.resourceProfileRepository.findById(resourceProfileId.trim());
  }

  async listResourceProfiles(): Promise<ListResourceProfilesResult> {
    const resourceProfiles = Object.freeze(
      [...(await this.resourceProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ resourceProfiles, total: resourceProfiles.length });
  }

  async updateResourceProfile(input: UpdateResourceProfileInput): Promise<ResourceProfile> {
    const resourceProfileId = input.resourceProfileId.trim();
    const existing = await this.resourceProfileRepository.findById(resourceProfileId);
    if (!existing) {
      throw new Error(`Resource profile not found: ${resourceProfileId}`);
    }

    const validation = await this.resourceProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.resourceProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.resourceProfileId !== existing.resourceProfileId) {
        throw new Error(`Resource profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createResourceProfile({
      resourceProfileId: existing.resourceProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.resourceProfileRepository.save(updated);
    await this.resourceProfileCatalog.register(updated);
    return updated;
  }

  async deleteResourceProfile(resourceProfileId: string): Promise<DeleteResourceProfileResult> {
    const normalizedResourceProfileId = resourceProfileId.trim();
    const deleted = await this.resourceProfileRepository.delete(normalizedResourceProfileId);
    if (deleted) {
      await this.resourceProfileCatalog.remove(normalizedResourceProfileId);
    }
    return Object.freeze({ resourceProfileId: normalizedResourceProfileId, deleted });
  }

  async findResourceProfileByName(name: string): Promise<FindResourceProfileByNameResult> {
    const normalizedName = name.trim();
    const resourceProfile = await this.resourceProfileRepository.findByName(normalizedName);
    return Object.freeze({ resourceProfile });
  }

  async listResourceProfilesByCategory(category: string): Promise<ListResourceProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const resourceProfiles = Object.freeze(
      [...(await this.resourceProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      resourceProfiles,
      total: resourceProfiles.length,
      category: normalizedCategory,
    });
  }

  async getResourceProfileRegistryStatistics(): Promise<ResourceProfileRegistryStatistics> {
    const resourceProfiles = await this.resourceProfileRepository.findAll();
    const activeResourceProfiles = resourceProfiles.filter(
      (resourceProfile) => resourceProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(resourceProfiles.map((resourceProfile) => resourceProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalResourceProfiles: resourceProfiles.length,
      activeResourceProfiles,
      categories,
    });
  }

  async serializeResourceProfile(resourceProfile: ResourceProfile): Promise<string> {
    return this.resourceProfileSerializer.serialize(resourceProfile);
  }

  async deserializeResourceProfile(serialized: string): Promise<ResourceProfile> {
    return this.resourceProfileSerializer.deserialize(serialized);
  }
}
