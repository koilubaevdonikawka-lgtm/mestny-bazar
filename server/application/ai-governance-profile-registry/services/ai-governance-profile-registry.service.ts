/**
 * AI Governance Profile Registry — unified registry for AI governance profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IGovernanceProfileCatalog } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-catalog.contract";
import type { IGovernanceProfileRepository } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-repository.contract";
import type { IGovernanceProfileSerializer } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-serializer.contract";
import type { IGovernanceProfileStatisticsProvider } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-statistics-provider.contract";
import type { IGovernanceProfileValidator } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-validator.contract";
import {
  createGovernanceProfile,
  type DeleteGovernanceProfileResult,
  type FindGovernanceProfileByNameResult,
  type GovernanceProfile,
  type GovernanceProfileRegistryStatistics,
  type ListGovernanceProfilesByCategoryResult,
  type ListGovernanceProfilesResult,
  type RegisterGovernanceProfileInput,
  type UpdateGovernanceProfileInput,
} from "@server/application/ai-governance-profile-registry/models/governance-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiGovernanceProfileRegistryService {
  constructor(
    private readonly governanceProfileRepository: IGovernanceProfileRepository,
    private readonly governanceProfileCatalog: IGovernanceProfileCatalog,
    private readonly governanceProfileValidator: IGovernanceProfileValidator,
    private readonly governanceProfileSerializer: IGovernanceProfileSerializer,
    private readonly statisticsProvider: IGovernanceProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerGovernanceProfile(input: RegisterGovernanceProfileInput): Promise<GovernanceProfile> {
    const validation = await this.governanceProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.governanceProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Governance profile already exists with name: ${input.name.trim()}`);
    }

    const governanceProfile = createGovernanceProfile({
      governanceProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.governanceProfileRepository.save(governanceProfile);
    await this.governanceProfileCatalog.register(governanceProfile);
    return governanceProfile;
  }

  async getGovernanceProfile(governanceProfileId: string): Promise<GovernanceProfile | null> {
    return this.governanceProfileRepository.findById(governanceProfileId.trim());
  }

  async listGovernanceProfiles(): Promise<ListGovernanceProfilesResult> {
    const governanceProfiles = Object.freeze(
      [...(await this.governanceProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ governanceProfiles, total: governanceProfiles.length });
  }

  async updateGovernanceProfile(input: UpdateGovernanceProfileInput): Promise<GovernanceProfile> {
    const governanceProfileId = input.governanceProfileId.trim();
    const existing = await this.governanceProfileRepository.findById(governanceProfileId);
    if (!existing) {
      throw new Error(`Governance profile not found: ${governanceProfileId}`);
    }

    const validation = await this.governanceProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.governanceProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.governanceProfileId !== existing.governanceProfileId) {
        throw new Error(`Governance profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createGovernanceProfile({
      governanceProfileId: existing.governanceProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.governanceProfileRepository.save(updated);
    await this.governanceProfileCatalog.register(updated);
    return updated;
  }

  async deleteGovernanceProfile(governanceProfileId: string): Promise<DeleteGovernanceProfileResult> {
    const normalizedGovernanceProfileId = governanceProfileId.trim();
    const deleted = await this.governanceProfileRepository.delete(normalizedGovernanceProfileId);
    if (deleted) {
      await this.governanceProfileCatalog.remove(normalizedGovernanceProfileId);
    }
    return Object.freeze({ governanceProfileId: normalizedGovernanceProfileId, deleted });
  }

  async findGovernanceProfileByName(name: string): Promise<FindGovernanceProfileByNameResult> {
    const normalizedName = name.trim();
    const governanceProfile = await this.governanceProfileRepository.findByName(normalizedName);
    return Object.freeze({ governanceProfile });
  }

  async listGovernanceProfilesByCategory(category: string): Promise<ListGovernanceProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const governanceProfiles = Object.freeze(
      [...(await this.governanceProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      governanceProfiles,
      total: governanceProfiles.length,
      category: normalizedCategory,
    });
  }

  async getGovernanceProfileRegistryStatistics(): Promise<GovernanceProfileRegistryStatistics> {
    const governanceProfiles = await this.governanceProfileRepository.findAll();
    const activeGovernanceProfiles = governanceProfiles.filter(
      (governanceProfile) => governanceProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(governanceProfiles.map((governanceProfile) => governanceProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalGovernanceProfiles: governanceProfiles.length,
      activeGovernanceProfiles,
      categories,
    });
  }

  async serializeGovernanceProfile(governanceProfile: GovernanceProfile): Promise<string> {
    return this.governanceProfileSerializer.serialize(governanceProfile);
  }

  async deserializeGovernanceProfile(serialized: string): Promise<GovernanceProfile> {
    return this.governanceProfileSerializer.deserialize(serialized);
  }
}
