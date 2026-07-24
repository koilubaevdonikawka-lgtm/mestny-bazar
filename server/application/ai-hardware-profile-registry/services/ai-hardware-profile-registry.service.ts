/**
 * AI Hardware Profile Registry — unified registry for AI hardware profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IHardwareProfileCatalog } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-catalog.contract";
import type { IHardwareProfileRepository } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-repository.contract";
import type { IHardwareProfileSerializer } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-serializer.contract";
import type { IHardwareProfileStatisticsProvider } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-statistics-provider.contract";
import type { IHardwareProfileValidator } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-validator.contract";
import {
  createHardwareProfile,
  type DeleteHardwareProfileResult,
  type FindHardwareProfileByNameResult,
  type HardwareProfile,
  type HardwareProfileRegistryStatistics,
  type ListHardwareProfilesByCategoryResult,
  type ListHardwareProfilesResult,
  type RegisterHardwareProfileInput,
  type UpdateHardwareProfileInput,
} from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiHardwareProfileRegistryService {
  constructor(
    private readonly hardwareProfileRepository: IHardwareProfileRepository,
    private readonly hardwareProfileCatalog: IHardwareProfileCatalog,
    private readonly hardwareProfileValidator: IHardwareProfileValidator,
    private readonly hardwareProfileSerializer: IHardwareProfileSerializer,
    private readonly statisticsProvider: IHardwareProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerHardwareProfile(input: RegisterHardwareProfileInput): Promise<HardwareProfile> {
    const validation = await this.hardwareProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.hardwareProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Hardware profile already exists with name: ${input.name.trim()}`);
    }

    const hardwareProfile = createHardwareProfile({
      hardwareProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.hardwareProfileRepository.save(hardwareProfile);
    await this.hardwareProfileCatalog.register(hardwareProfile);
    return hardwareProfile;
  }

  async getHardwareProfile(hardwareProfileId: string): Promise<HardwareProfile | null> {
    return this.hardwareProfileRepository.findById(hardwareProfileId.trim());
  }

  async listHardwareProfiles(): Promise<ListHardwareProfilesResult> {
    const hardwareProfiles = Object.freeze(
      [...(await this.hardwareProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ hardwareProfiles, total: hardwareProfiles.length });
  }

  async updateHardwareProfile(input: UpdateHardwareProfileInput): Promise<HardwareProfile> {
    const hardwareProfileId = input.hardwareProfileId.trim();
    const existing = await this.hardwareProfileRepository.findById(hardwareProfileId);
    if (!existing) {
      throw new Error(`Hardware profile not found: ${hardwareProfileId}`);
    }

    const validation = await this.hardwareProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.hardwareProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.hardwareProfileId !== existing.hardwareProfileId) {
        throw new Error(`Hardware profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createHardwareProfile({
      hardwareProfileId: existing.hardwareProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.hardwareProfileRepository.save(updated);
    await this.hardwareProfileCatalog.register(updated);
    return updated;
  }

  async deleteHardwareProfile(hardwareProfileId: string): Promise<DeleteHardwareProfileResult> {
    const normalizedHardwareProfileId = hardwareProfileId.trim();
    const deleted = await this.hardwareProfileRepository.delete(normalizedHardwareProfileId);
    if (deleted) {
      await this.hardwareProfileCatalog.remove(normalizedHardwareProfileId);
    }
    return Object.freeze({ hardwareProfileId: normalizedHardwareProfileId, deleted });
  }

  async findHardwareProfileByName(name: string): Promise<FindHardwareProfileByNameResult> {
    const normalizedName = name.trim();
    const hardwareProfile = await this.hardwareProfileRepository.findByName(normalizedName);
    return Object.freeze({ hardwareProfile });
  }

  async listHardwareProfilesByCategory(
    category: string,
  ): Promise<ListHardwareProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const hardwareProfiles = Object.freeze(
      [...(await this.hardwareProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      hardwareProfiles,
      total: hardwareProfiles.length,
      category: normalizedCategory,
    });
  }

  async getHardwareProfileRegistryStatistics(): Promise<HardwareProfileRegistryStatistics> {
    const hardwareProfiles = await this.hardwareProfileRepository.findAll();
    const activeHardwareProfiles = hardwareProfiles.filter(
      (hardwareProfile) => hardwareProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(hardwareProfiles.map((hardwareProfile) => hardwareProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalHardwareProfiles: hardwareProfiles.length,
      activeHardwareProfiles,
      categories,
    });
  }

  async serializeHardwareProfile(hardwareProfile: HardwareProfile): Promise<string> {
    return this.hardwareProfileSerializer.serialize(hardwareProfile);
  }

  async deserializeHardwareProfile(serialized: string): Promise<HardwareProfile> {
    return this.hardwareProfileSerializer.deserialize(serialized);
  }
}
