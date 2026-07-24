/**
 * AI Capability Profile Registry — unified registry for AI capability profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ICapabilityProfileCatalog } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-catalog.contract";
import type { ICapabilityProfileRepository } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-repository.contract";
import type { ICapabilityProfileSerializer } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-serializer.contract";
import type { ICapabilityProfileStatisticsProvider } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-statistics-provider.contract";
import type { ICapabilityProfileValidator } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-validator.contract";
import {
  createCapabilityProfile,
  type DeleteCapabilityProfileResult,
  type FindCapabilityProfileByNameResult,
  type CapabilityProfile,
  type CapabilityProfileRegistryStatistics,
  type ListCapabilityProfilesByCategoryResult,
  type ListCapabilityProfilesResult,
  type RegisterCapabilityProfileInput,
  type UpdateCapabilityProfileInput,
} from "@server/application/ai-capability-profile-registry/models/capability-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiCapabilityProfileRegistryService {
  constructor(
    private readonly capabilityProfileRepository: ICapabilityProfileRepository,
    private readonly capabilityProfileCatalog: ICapabilityProfileCatalog,
    private readonly capabilityProfileValidator: ICapabilityProfileValidator,
    private readonly capabilityProfileSerializer: ICapabilityProfileSerializer,
    private readonly statisticsProvider: ICapabilityProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerCapabilityProfile(input: RegisterCapabilityProfileInput): Promise<CapabilityProfile> {
    const validation = await this.capabilityProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.capabilityProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Capability profile already exists with name: ${input.name.trim()}`);
    }

    const capabilityProfile = createCapabilityProfile({
      capabilityProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.capabilityProfileRepository.save(capabilityProfile);
    await this.capabilityProfileCatalog.register(capabilityProfile);
    return capabilityProfile;
  }

  async getCapabilityProfile(capabilityProfileId: string): Promise<CapabilityProfile | null> {
    return this.capabilityProfileRepository.findById(capabilityProfileId.trim());
  }

  async listCapabilityProfiles(): Promise<ListCapabilityProfilesResult> {
    const capabilityProfiles = Object.freeze(
      [...(await this.capabilityProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ capabilityProfiles, total: capabilityProfiles.length });
  }

  async updateCapabilityProfile(input: UpdateCapabilityProfileInput): Promise<CapabilityProfile> {
    const capabilityProfileId = input.capabilityProfileId.trim();
    const existing = await this.capabilityProfileRepository.findById(capabilityProfileId);
    if (!existing) {
      throw new Error(`Capability profile not found: ${capabilityProfileId}`);
    }

    const validation = await this.capabilityProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.capabilityProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.capabilityProfileId !== existing.capabilityProfileId) {
        throw new Error(`Capability profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createCapabilityProfile({
      capabilityProfileId: existing.capabilityProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.capabilityProfileRepository.save(updated);
    await this.capabilityProfileCatalog.register(updated);
    return updated;
  }

  async deleteCapabilityProfile(capabilityProfileId: string): Promise<DeleteCapabilityProfileResult> {
    const normalizedCapabilityProfileId = capabilityProfileId.trim();
    const deleted = await this.capabilityProfileRepository.delete(normalizedCapabilityProfileId);
    if (deleted) {
      await this.capabilityProfileCatalog.remove(normalizedCapabilityProfileId);
    }
    return Object.freeze({ capabilityProfileId: normalizedCapabilityProfileId, deleted });
  }

  async findCapabilityProfileByName(name: string): Promise<FindCapabilityProfileByNameResult> {
    const normalizedName = name.trim();
    const capabilityProfile = await this.capabilityProfileRepository.findByName(normalizedName);
    return Object.freeze({ capabilityProfile });
  }

  async listCapabilityProfilesByCategory(category: string): Promise<ListCapabilityProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const capabilityProfiles = Object.freeze(
      [...(await this.capabilityProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      capabilityProfiles,
      total: capabilityProfiles.length,
      category: normalizedCategory,
    });
  }

  async getCapabilityProfileRegistryStatistics(): Promise<CapabilityProfileRegistryStatistics> {
    const capabilityProfiles = await this.capabilityProfileRepository.findAll();
    const activeCapabilityProfiles = capabilityProfiles.filter(
      (capabilityProfile) => capabilityProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(capabilityProfiles.map((capabilityProfile) => capabilityProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalCapabilityProfiles: capabilityProfiles.length,
      activeCapabilityProfiles,
      categories,
    });
  }

  async serializeCapabilityProfile(capabilityProfile: CapabilityProfile): Promise<string> {
    return this.capabilityProfileSerializer.serialize(capabilityProfile);
  }

  async deserializeCapabilityProfile(serialized: string): Promise<CapabilityProfile> {
    return this.capabilityProfileSerializer.deserialize(serialized);
  }
}
