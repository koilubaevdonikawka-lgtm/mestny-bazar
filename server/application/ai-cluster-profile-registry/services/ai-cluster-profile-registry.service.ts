/**
 * AI Cluster Profile Registry — unified registry for AI cluster profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IClusterProfileCatalog } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-catalog.contract";
import type { IClusterProfileRepository } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-repository.contract";
import type { IClusterProfileSerializer } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-serializer.contract";
import type { IClusterProfileStatisticsProvider } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-statistics-provider.contract";
import type { IClusterProfileValidator } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-validator.contract";
import {
  createClusterProfile,
  type DeleteClusterProfileResult,
  type FindClusterProfileByNameResult,
  type ClusterProfile,
  type ClusterProfileRegistryStatistics,
  type ListClusterProfilesByCategoryResult,
  type ListClusterProfilesResult,
  type RegisterClusterProfileInput,
  type UpdateClusterProfileInput,
} from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiClusterProfileRegistryService {
  constructor(
    private readonly clusterProfileRepository: IClusterProfileRepository,
    private readonly clusterProfileCatalog: IClusterProfileCatalog,
    private readonly clusterProfileValidator: IClusterProfileValidator,
    private readonly clusterProfileSerializer: IClusterProfileSerializer,
    private readonly statisticsProvider: IClusterProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerClusterProfile(input: RegisterClusterProfileInput): Promise<ClusterProfile> {
    const validation = await this.clusterProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.clusterProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Cluster profile already exists with name: ${input.name.trim()}`);
    }

    const clusterProfile = createClusterProfile({
      clusterProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.clusterProfileRepository.save(clusterProfile);
    await this.clusterProfileCatalog.register(clusterProfile);
    return clusterProfile;
  }

  async getClusterProfile(clusterProfileId: string): Promise<ClusterProfile | null> {
    return this.clusterProfileRepository.findById(clusterProfileId.trim());
  }

  async listClusterProfiles(): Promise<ListClusterProfilesResult> {
    const clusterProfiles = Object.freeze(
      [...(await this.clusterProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ clusterProfiles, total: clusterProfiles.length });
  }

  async updateClusterProfile(input: UpdateClusterProfileInput): Promise<ClusterProfile> {
    const clusterProfileId = input.clusterProfileId.trim();
    const existing = await this.clusterProfileRepository.findById(clusterProfileId);
    if (!existing) {
      throw new Error(`Cluster profile not found: ${clusterProfileId}`);
    }

    const validation = await this.clusterProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.clusterProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.clusterProfileId !== existing.clusterProfileId) {
        throw new Error(`Cluster profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createClusterProfile({
      clusterProfileId: existing.clusterProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.clusterProfileRepository.save(updated);
    await this.clusterProfileCatalog.register(updated);
    return updated;
  }

  async deleteClusterProfile(clusterProfileId: string): Promise<DeleteClusterProfileResult> {
    const normalizedClusterProfileId = clusterProfileId.trim();
    const deleted = await this.clusterProfileRepository.delete(normalizedClusterProfileId);
    if (deleted) {
      await this.clusterProfileCatalog.remove(normalizedClusterProfileId);
    }
    return Object.freeze({ clusterProfileId: normalizedClusterProfileId, deleted });
  }

  async findClusterProfileByName(name: string): Promise<FindClusterProfileByNameResult> {
    const normalizedName = name.trim();
    const clusterProfile = await this.clusterProfileRepository.findByName(normalizedName);
    return Object.freeze({ clusterProfile });
  }

  async listClusterProfilesByCategory(category: string): Promise<ListClusterProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const clusterProfiles = Object.freeze(
      [...(await this.clusterProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      clusterProfiles,
      total: clusterProfiles.length,
      category: normalizedCategory,
    });
  }

  async getClusterProfileRegistryStatistics(): Promise<ClusterProfileRegistryStatistics> {
    const clusterProfiles = await this.clusterProfileRepository.findAll();
    const activeClusterProfiles = clusterProfiles.filter(
      (clusterProfile) => clusterProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(clusterProfiles.map((clusterProfile) => clusterProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalClusterProfiles: clusterProfiles.length,
      activeClusterProfiles,
      categories,
    });
  }

  async serializeClusterProfile(clusterProfile: ClusterProfile): Promise<string> {
    return this.clusterProfileSerializer.serialize(clusterProfile);
  }

  async deserializeClusterProfile(serialized: string): Promise<ClusterProfile> {
    return this.clusterProfileSerializer.deserialize(serialized);
  }
}
