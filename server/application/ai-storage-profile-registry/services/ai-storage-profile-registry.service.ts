/**
 * AI Storage Profile Registry — unified registry for AI storage profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IStorageProfileCatalog } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-catalog.contract";
import type { IStorageProfileRepository } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-repository.contract";
import type { IStorageProfileSerializer } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-serializer.contract";
import type { IStorageProfileStatisticsProvider } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-statistics-provider.contract";
import type { IStorageProfileValidator } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-validator.contract";
import {
  createStorageProfile,
  type DeleteStorageProfileResult,
  type FindStorageProfileByNameResult,
  type StorageProfile,
  type StorageProfileRegistryStatistics,
  type ListStorageProfilesByCategoryResult,
  type ListStorageProfilesResult,
  type RegisterStorageProfileInput,
  type UpdateStorageProfileInput,
} from "@server/application/ai-storage-profile-registry/models/storage-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiStorageProfileRegistryService {
  constructor(
    private readonly storageProfileRepository: IStorageProfileRepository,
    private readonly storageProfileCatalog: IStorageProfileCatalog,
    private readonly storageProfileValidator: IStorageProfileValidator,
    private readonly storageProfileSerializer: IStorageProfileSerializer,
    private readonly statisticsProvider: IStorageProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerStorageProfile(input: RegisterStorageProfileInput): Promise<StorageProfile> {
    const validation = await this.storageProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.storageProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Storage profile already exists with name: ${input.name.trim()}`);
    }

    const storageProfile = createStorageProfile({
      storageProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.storageProfileRepository.save(storageProfile);
    await this.storageProfileCatalog.register(storageProfile);
    return storageProfile;
  }

  async getStorageProfile(storageProfileId: string): Promise<StorageProfile | null> {
    return this.storageProfileRepository.findById(storageProfileId.trim());
  }

  async listStorageProfiles(): Promise<ListStorageProfilesResult> {
    const storageProfiles = Object.freeze(
      [...(await this.storageProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ storageProfiles, total: storageProfiles.length });
  }

  async updateStorageProfile(input: UpdateStorageProfileInput): Promise<StorageProfile> {
    const storageProfileId = input.storageProfileId.trim();
    const existing = await this.storageProfileRepository.findById(storageProfileId);
    if (!existing) {
      throw new Error(`Storage profile not found: ${storageProfileId}`);
    }

    const validation = await this.storageProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.storageProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.storageProfileId !== existing.storageProfileId) {
        throw new Error(`Storage profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createStorageProfile({
      storageProfileId: existing.storageProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.storageProfileRepository.save(updated);
    await this.storageProfileCatalog.register(updated);
    return updated;
  }

  async deleteStorageProfile(storageProfileId: string): Promise<DeleteStorageProfileResult> {
    const normalizedStorageProfileId = storageProfileId.trim();
    const deleted = await this.storageProfileRepository.delete(normalizedStorageProfileId);
    if (deleted) {
      await this.storageProfileCatalog.remove(normalizedStorageProfileId);
    }
    return Object.freeze({ storageProfileId: normalizedStorageProfileId, deleted });
  }

  async findStorageProfileByName(name: string): Promise<FindStorageProfileByNameResult> {
    const normalizedName = name.trim();
    const storageProfile = await this.storageProfileRepository.findByName(normalizedName);
    return Object.freeze({ storageProfile });
  }

  async listStorageProfilesByCategory(category: string): Promise<ListStorageProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const storageProfiles = Object.freeze(
      [...(await this.storageProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      storageProfiles,
      total: storageProfiles.length,
      category: normalizedCategory,
    });
  }

  async getStorageProfileRegistryStatistics(): Promise<StorageProfileRegistryStatistics> {
    const storageProfiles = await this.storageProfileRepository.findAll();
    const activeStorageProfiles = storageProfiles.filter(
      (storageProfile) => storageProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(storageProfiles.map((storageProfile) => storageProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalStorageProfiles: storageProfiles.length,
      activeStorageProfiles,
      categories,
    });
  }

  async serializeStorageProfile(storageProfile: StorageProfile): Promise<string> {
    return this.storageProfileSerializer.serialize(storageProfile);
  }

  async deserializeStorageProfile(serialized: string): Promise<StorageProfile> {
    return this.storageProfileSerializer.deserialize(serialized);
  }
}
