/**
 * AI Accelerator Profile Registry — unified registry for AI accelerator profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IAcceleratorProfileCatalog } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-catalog.contract";
import type { IAcceleratorProfileRepository } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-repository.contract";
import type { IAcceleratorProfileSerializer } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-serializer.contract";
import type { IAcceleratorProfileStatisticsProvider } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-statistics-provider.contract";
import type { IAcceleratorProfileValidator } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-validator.contract";
import {
  createAcceleratorProfile,
  type DeleteAcceleratorProfileResult,
  type FindAcceleratorProfileByNameResult,
  type AcceleratorProfile,
  type AcceleratorProfileRegistryStatistics,
  type ListAcceleratorProfilesByCategoryResult,
  type ListAcceleratorProfilesResult,
  type RegisterAcceleratorProfileInput,
  type UpdateAcceleratorProfileInput,
} from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiAcceleratorProfileRegistryService {
  constructor(
    private readonly acceleratorProfileRepository: IAcceleratorProfileRepository,
    private readonly acceleratorProfileCatalog: IAcceleratorProfileCatalog,
    private readonly acceleratorProfileValidator: IAcceleratorProfileValidator,
    private readonly acceleratorProfileSerializer: IAcceleratorProfileSerializer,
    private readonly statisticsProvider: IAcceleratorProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerAcceleratorProfile(input: RegisterAcceleratorProfileInput): Promise<AcceleratorProfile> {
    const validation = await this.acceleratorProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.acceleratorProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Accelerator profile already exists with name: ${input.name.trim()}`);
    }

    const acceleratorProfile = createAcceleratorProfile({
      acceleratorProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.acceleratorProfileRepository.save(acceleratorProfile);
    await this.acceleratorProfileCatalog.register(acceleratorProfile);
    return acceleratorProfile;
  }

  async getAcceleratorProfile(acceleratorProfileId: string): Promise<AcceleratorProfile | null> {
    return this.acceleratorProfileRepository.findById(acceleratorProfileId.trim());
  }

  async listAcceleratorProfiles(): Promise<ListAcceleratorProfilesResult> {
    const acceleratorProfiles = Object.freeze(
      [...(await this.acceleratorProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ acceleratorProfiles, total: acceleratorProfiles.length });
  }

  async updateAcceleratorProfile(input: UpdateAcceleratorProfileInput): Promise<AcceleratorProfile> {
    const acceleratorProfileId = input.acceleratorProfileId.trim();
    const existing = await this.acceleratorProfileRepository.findById(acceleratorProfileId);
    if (!existing) {
      throw new Error(`Accelerator profile not found: ${acceleratorProfileId}`);
    }

    const validation = await this.acceleratorProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.acceleratorProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.acceleratorProfileId !== existing.acceleratorProfileId) {
        throw new Error(`Accelerator profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createAcceleratorProfile({
      acceleratorProfileId: existing.acceleratorProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.acceleratorProfileRepository.save(updated);
    await this.acceleratorProfileCatalog.register(updated);
    return updated;
  }

  async deleteAcceleratorProfile(acceleratorProfileId: string): Promise<DeleteAcceleratorProfileResult> {
    const normalizedAcceleratorProfileId = acceleratorProfileId.trim();
    const deleted = await this.acceleratorProfileRepository.delete(normalizedAcceleratorProfileId);
    if (deleted) {
      await this.acceleratorProfileCatalog.remove(normalizedAcceleratorProfileId);
    }
    return Object.freeze({ acceleratorProfileId: normalizedAcceleratorProfileId, deleted });
  }

  async findAcceleratorProfileByName(name: string): Promise<FindAcceleratorProfileByNameResult> {
    const normalizedName = name.trim();
    const acceleratorProfile = await this.acceleratorProfileRepository.findByName(normalizedName);
    return Object.freeze({ acceleratorProfile });
  }

  async listAcceleratorProfilesByCategory(
    category: string,
  ): Promise<ListAcceleratorProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const acceleratorProfiles = Object.freeze(
      [...(await this.acceleratorProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      acceleratorProfiles,
      total: acceleratorProfiles.length,
      category: normalizedCategory,
    });
  }

  async getAcceleratorProfileRegistryStatistics(): Promise<AcceleratorProfileRegistryStatistics> {
    const acceleratorProfiles = await this.acceleratorProfileRepository.findAll();
    const activeAcceleratorProfiles = acceleratorProfiles.filter(
      (acceleratorProfile) => acceleratorProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(acceleratorProfiles.map((acceleratorProfile) => acceleratorProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalAcceleratorProfiles: acceleratorProfiles.length,
      activeAcceleratorProfiles,
      categories,
    });
  }

  async serializeAcceleratorProfile(acceleratorProfile: AcceleratorProfile): Promise<string> {
    return this.acceleratorProfileSerializer.serialize(acceleratorProfile);
  }

  async deserializeAcceleratorProfile(serialized: string): Promise<AcceleratorProfile> {
    return this.acceleratorProfileSerializer.deserialize(serialized);
  }
}
