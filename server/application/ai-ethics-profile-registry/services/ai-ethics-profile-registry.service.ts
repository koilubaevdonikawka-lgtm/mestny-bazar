/**
 * AI Ethics Profile Registry — unified registry for AI ethics profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IEthicsProfileCatalog } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-catalog.contract";
import type { IEthicsProfileRepository } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-repository.contract";
import type { IEthicsProfileSerializer } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-serializer.contract";
import type { IEthicsProfileStatisticsProvider } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-statistics-provider.contract";
import type { IEthicsProfileValidator } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-validator.contract";
import {
  createEthicsProfile,
  type DeleteEthicsProfileResult,
  type FindEthicsProfileByNameResult,
  type EthicsProfile,
  type EthicsProfileRegistryStatistics,
  type ListEthicsProfilesByCategoryResult,
  type ListEthicsProfilesResult,
  type RegisterEthicsProfileInput,
  type UpdateEthicsProfileInput,
} from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiEthicsProfileRegistryService {
  constructor(
    private readonly ethicsProfileRepository: IEthicsProfileRepository,
    private readonly ethicsProfileCatalog: IEthicsProfileCatalog,
    private readonly ethicsProfileValidator: IEthicsProfileValidator,
    private readonly ethicsProfileSerializer: IEthicsProfileSerializer,
    private readonly statisticsProvider: IEthicsProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerEthicsProfile(input: RegisterEthicsProfileInput): Promise<EthicsProfile> {
    const validation = await this.ethicsProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.ethicsProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Ethics profile already exists with name: ${input.name.trim()}`);
    }

    const ethicsProfile = createEthicsProfile({
      ethicsProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.ethicsProfileRepository.save(ethicsProfile);
    await this.ethicsProfileCatalog.register(ethicsProfile);
    return ethicsProfile;
  }

  async getEthicsProfile(ethicsProfileId: string): Promise<EthicsProfile | null> {
    return this.ethicsProfileRepository.findById(ethicsProfileId.trim());
  }

  async listEthicsProfiles(): Promise<ListEthicsProfilesResult> {
    const ethicsProfiles = Object.freeze(
      [...(await this.ethicsProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ ethicsProfiles, total: ethicsProfiles.length });
  }

  async updateEthicsProfile(input: UpdateEthicsProfileInput): Promise<EthicsProfile> {
    const ethicsProfileId = input.ethicsProfileId.trim();
    const existing = await this.ethicsProfileRepository.findById(ethicsProfileId);
    if (!existing) {
      throw new Error(`Ethics profile not found: ${ethicsProfileId}`);
    }

    const validation = await this.ethicsProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.ethicsProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.ethicsProfileId !== existing.ethicsProfileId) {
        throw new Error(`Ethics profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createEthicsProfile({
      ethicsProfileId: existing.ethicsProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.ethicsProfileRepository.save(updated);
    await this.ethicsProfileCatalog.register(updated);
    return updated;
  }

  async deleteEthicsProfile(ethicsProfileId: string): Promise<DeleteEthicsProfileResult> {
    const normalizedEthicsProfileId = ethicsProfileId.trim();
    const deleted = await this.ethicsProfileRepository.delete(normalizedEthicsProfileId);
    if (deleted) {
      await this.ethicsProfileCatalog.remove(normalizedEthicsProfileId);
    }
    return Object.freeze({ ethicsProfileId: normalizedEthicsProfileId, deleted });
  }

  async findEthicsProfileByName(name: string): Promise<FindEthicsProfileByNameResult> {
    const normalizedName = name.trim();
    const ethicsProfile = await this.ethicsProfileRepository.findByName(normalizedName);
    return Object.freeze({ ethicsProfile });
  }

  async listEthicsProfilesByCategory(category: string): Promise<ListEthicsProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const ethicsProfiles = Object.freeze(
      [...(await this.ethicsProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      ethicsProfiles,
      total: ethicsProfiles.length,
      category: normalizedCategory,
    });
  }

  async getEthicsProfileRegistryStatistics(): Promise<EthicsProfileRegistryStatistics> {
    const ethicsProfiles = await this.ethicsProfileRepository.findAll();
    const activeEthicsProfiles = ethicsProfiles.filter(
      (ethicsProfile) => ethicsProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(ethicsProfiles.map((ethicsProfile) => ethicsProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalEthicsProfiles: ethicsProfiles.length,
      activeEthicsProfiles,
      categories,
    });
  }

  async serializeEthicsProfile(ethicsProfile: EthicsProfile): Promise<string> {
    return this.ethicsProfileSerializer.serialize(ethicsProfile);
  }

  async deserializeEthicsProfile(serialized: string): Promise<EthicsProfile> {
    return this.ethicsProfileSerializer.deserialize(serialized);
  }
}
