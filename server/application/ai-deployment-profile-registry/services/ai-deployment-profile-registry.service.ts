/**
 * AI Deployment Profile Registry — unified registry for AI deployment profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IDeploymentProfileCatalog } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-catalog.contract";
import type { IDeploymentProfileRepository } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-repository.contract";
import type { IDeploymentProfileSerializer } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-serializer.contract";
import type { IDeploymentProfileStatisticsProvider } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-statistics-provider.contract";
import type { IDeploymentProfileValidator } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-validator.contract";
import {
  createDeploymentProfile,
  type DeleteDeploymentProfileResult,
  type DeploymentProfile,
  type DeploymentProfileRegistryStatistics,
  type FindDeploymentProfileByNameResult,
  type ListDeploymentProfilesByCategoryResult,
  type ListDeploymentProfilesResult,
  type RegisterDeploymentProfileInput,
  type UpdateDeploymentProfileInput,
} from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiDeploymentProfileRegistryService {
  constructor(
    private readonly deploymentProfileRepository: IDeploymentProfileRepository,
    private readonly deploymentProfileCatalog: IDeploymentProfileCatalog,
    private readonly deploymentProfileValidator: IDeploymentProfileValidator,
    private readonly deploymentProfileSerializer: IDeploymentProfileSerializer,
    private readonly statisticsProvider: IDeploymentProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerDeploymentProfile(input: RegisterDeploymentProfileInput): Promise<DeploymentProfile> {
    const validation = await this.deploymentProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.deploymentProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Deployment profile already exists with name: ${input.name.trim()}`);
    }

    const deploymentProfile = createDeploymentProfile({
      deploymentProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.deploymentProfileRepository.save(deploymentProfile);
    await this.deploymentProfileCatalog.register(deploymentProfile);
    return deploymentProfile;
  }

  async getDeploymentProfile(deploymentProfileId: string): Promise<DeploymentProfile | null> {
    return this.deploymentProfileRepository.findById(deploymentProfileId.trim());
  }

  async listDeploymentProfiles(): Promise<ListDeploymentProfilesResult> {
    const deploymentProfiles = Object.freeze(
      [...(await this.deploymentProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ deploymentProfiles, total: deploymentProfiles.length });
  }

  async updateDeploymentProfile(input: UpdateDeploymentProfileInput): Promise<DeploymentProfile> {
    const deploymentProfileId = input.deploymentProfileId.trim();
    const existing = await this.deploymentProfileRepository.findById(deploymentProfileId);
    if (!existing) {
      throw new Error(`Deployment profile not found: ${deploymentProfileId}`);
    }

    const validation = await this.deploymentProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.deploymentProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.deploymentProfileId !== existing.deploymentProfileId) {
        throw new Error(`Deployment profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createDeploymentProfile({
      deploymentProfileId: existing.deploymentProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.deploymentProfileRepository.save(updated);
    await this.deploymentProfileCatalog.register(updated);
    return updated;
  }

  async deleteDeploymentProfile(deploymentProfileId: string): Promise<DeleteDeploymentProfileResult> {
    const normalizedDeploymentProfileId = deploymentProfileId.trim();
    const deleted = await this.deploymentProfileRepository.delete(normalizedDeploymentProfileId);
    if (deleted) {
      await this.deploymentProfileCatalog.remove(normalizedDeploymentProfileId);
    }
    return Object.freeze({ deploymentProfileId: normalizedDeploymentProfileId, deleted });
  }

  async findDeploymentProfileByName(name: string): Promise<FindDeploymentProfileByNameResult> {
    const normalizedName = name.trim();
    const deploymentProfile = await this.deploymentProfileRepository.findByName(normalizedName);
    return Object.freeze({ deploymentProfile });
  }

  async listDeploymentProfilesByCategory(
    category: string,
  ): Promise<ListDeploymentProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const deploymentProfiles = Object.freeze(
      [...(await this.deploymentProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      deploymentProfiles,
      total: deploymentProfiles.length,
      category: normalizedCategory,
    });
  }

  async getDeploymentProfileRegistryStatistics(): Promise<DeploymentProfileRegistryStatistics> {
    const deploymentProfiles = await this.deploymentProfileRepository.findAll();
    const activeDeploymentProfiles = deploymentProfiles.filter(
      (deploymentProfile) => deploymentProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(deploymentProfiles.map((deploymentProfile) => deploymentProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalDeploymentProfiles: deploymentProfiles.length,
      activeDeploymentProfiles,
      categories,
    });
  }

  async serializeDeploymentProfile(deploymentProfile: DeploymentProfile): Promise<string> {
    return this.deploymentProfileSerializer.serialize(deploymentProfile);
  }

  async deserializeDeploymentProfile(serialized: string): Promise<DeploymentProfile> {
    return this.deploymentProfileSerializer.deserialize(serialized);
  }
}
