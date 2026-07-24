/**
 * AI Network Profile Registry — unified registry for AI network profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { INetworkProfileCatalog } from "@server/application/ai-network-profile-registry/contracts/network-profile-catalog.contract";
import type { INetworkProfileRepository } from "@server/application/ai-network-profile-registry/contracts/network-profile-repository.contract";
import type { INetworkProfileSerializer } from "@server/application/ai-network-profile-registry/contracts/network-profile-serializer.contract";
import type { INetworkProfileStatisticsProvider } from "@server/application/ai-network-profile-registry/contracts/network-profile-statistics-provider.contract";
import type { INetworkProfileValidator } from "@server/application/ai-network-profile-registry/contracts/network-profile-validator.contract";
import {
  createNetworkProfile,
  type DeleteNetworkProfileResult,
  type FindNetworkProfileByNameResult,
  type NetworkProfile,
  type NetworkProfileRegistryStatistics,
  type ListNetworkProfilesByCategoryResult,
  type ListNetworkProfilesResult,
  type RegisterNetworkProfileInput,
  type UpdateNetworkProfileInput,
} from "@server/application/ai-network-profile-registry/models/network-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiNetworkProfileRegistryService {
  constructor(
    private readonly networkProfileRepository: INetworkProfileRepository,
    private readonly networkProfileCatalog: INetworkProfileCatalog,
    private readonly networkProfileValidator: INetworkProfileValidator,
    private readonly networkProfileSerializer: INetworkProfileSerializer,
    private readonly statisticsProvider: INetworkProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerNetworkProfile(input: RegisterNetworkProfileInput): Promise<NetworkProfile> {
    const validation = await this.networkProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.networkProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Network profile already exists with name: ${input.name.trim()}`);
    }

    const networkProfile = createNetworkProfile({
      networkProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.networkProfileRepository.save(networkProfile);
    await this.networkProfileCatalog.register(networkProfile);
    return networkProfile;
  }

  async getNetworkProfile(networkProfileId: string): Promise<NetworkProfile | null> {
    return this.networkProfileRepository.findById(networkProfileId.trim());
  }

  async listNetworkProfiles(): Promise<ListNetworkProfilesResult> {
    const networkProfiles = Object.freeze(
      [...(await this.networkProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ networkProfiles, total: networkProfiles.length });
  }

  async updateNetworkProfile(input: UpdateNetworkProfileInput): Promise<NetworkProfile> {
    const networkProfileId = input.networkProfileId.trim();
    const existing = await this.networkProfileRepository.findById(networkProfileId);
    if (!existing) {
      throw new Error(`Network profile not found: ${networkProfileId}`);
    }

    const validation = await this.networkProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.networkProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.networkProfileId !== existing.networkProfileId) {
        throw new Error(`Network profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createNetworkProfile({
      networkProfileId: existing.networkProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.networkProfileRepository.save(updated);
    await this.networkProfileCatalog.register(updated);
    return updated;
  }

  async deleteNetworkProfile(networkProfileId: string): Promise<DeleteNetworkProfileResult> {
    const normalizedNetworkProfileId = networkProfileId.trim();
    const deleted = await this.networkProfileRepository.delete(normalizedNetworkProfileId);
    if (deleted) {
      await this.networkProfileCatalog.remove(normalizedNetworkProfileId);
    }
    return Object.freeze({ networkProfileId: normalizedNetworkProfileId, deleted });
  }

  async findNetworkProfileByName(name: string): Promise<FindNetworkProfileByNameResult> {
    const normalizedName = name.trim();
    const networkProfile = await this.networkProfileRepository.findByName(normalizedName);
    return Object.freeze({ networkProfile });
  }

  async listNetworkProfilesByCategory(category: string): Promise<ListNetworkProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const networkProfiles = Object.freeze(
      [...(await this.networkProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      networkProfiles,
      total: networkProfiles.length,
      category: normalizedCategory,
    });
  }

  async getNetworkProfileRegistryStatistics(): Promise<NetworkProfileRegistryStatistics> {
    const networkProfiles = await this.networkProfileRepository.findAll();
    const activeNetworkProfiles = networkProfiles.filter(
      (networkProfile) => networkProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(networkProfiles.map((networkProfile) => networkProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalNetworkProfiles: networkProfiles.length,
      activeNetworkProfiles,
      categories,
    });
  }

  async serializeNetworkProfile(networkProfile: NetworkProfile): Promise<string> {
    return this.networkProfileSerializer.serialize(networkProfile);
  }

  async deserializeNetworkProfile(serialized: string): Promise<NetworkProfile> {
    return this.networkProfileSerializer.deserialize(serialized);
  }
}
