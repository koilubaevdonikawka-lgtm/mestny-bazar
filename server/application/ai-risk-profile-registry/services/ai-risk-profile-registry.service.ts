/**
 * AI Risk Profile Registry — unified registry for AI risk profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IRiskProfileCatalog } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-catalog.contract";
import type { IRiskProfileRepository } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-repository.contract";
import type { IRiskProfileSerializer } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-serializer.contract";
import type { IRiskProfileStatisticsProvider } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-statistics-provider.contract";
import type { IRiskProfileValidator } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-validator.contract";
import {
  createRiskProfile,
  type DeleteRiskProfileResult,
  type FindRiskProfileByNameResult,
  type RiskProfile,
  type RiskProfileRegistryStatistics,
  type ListRiskProfilesByCategoryResult,
  type ListRiskProfilesResult,
  type RegisterRiskProfileInput,
  type UpdateRiskProfileInput,
} from "@server/application/ai-risk-profile-registry/models/risk-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiRiskProfileRegistryService {
  constructor(
    private readonly riskProfileRepository: IRiskProfileRepository,
    private readonly riskProfileCatalog: IRiskProfileCatalog,
    private readonly riskProfileValidator: IRiskProfileValidator,
    private readonly riskProfileSerializer: IRiskProfileSerializer,
    private readonly statisticsProvider: IRiskProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerRiskProfile(input: RegisterRiskProfileInput): Promise<RiskProfile> {
    const validation = await this.riskProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.riskProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Risk profile already exists with name: ${input.name.trim()}`);
    }

    const riskProfile = createRiskProfile({
      riskProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.riskProfileRepository.save(riskProfile);
    await this.riskProfileCatalog.register(riskProfile);
    return riskProfile;
  }

  async getRiskProfile(riskProfileId: string): Promise<RiskProfile | null> {
    return this.riskProfileRepository.findById(riskProfileId.trim());
  }

  async listRiskProfiles(): Promise<ListRiskProfilesResult> {
    const riskProfiles = Object.freeze(
      [...(await this.riskProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ riskProfiles, total: riskProfiles.length });
  }

  async updateRiskProfile(input: UpdateRiskProfileInput): Promise<RiskProfile> {
    const riskProfileId = input.riskProfileId.trim();
    const existing = await this.riskProfileRepository.findById(riskProfileId);
    if (!existing) {
      throw new Error(`Risk profile not found: ${riskProfileId}`);
    }

    const validation = await this.riskProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.riskProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.riskProfileId !== existing.riskProfileId) {
        throw new Error(`Risk profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createRiskProfile({
      riskProfileId: existing.riskProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.riskProfileRepository.save(updated);
    await this.riskProfileCatalog.register(updated);
    return updated;
  }

  async deleteRiskProfile(riskProfileId: string): Promise<DeleteRiskProfileResult> {
    const normalizedRiskProfileId = riskProfileId.trim();
    const deleted = await this.riskProfileRepository.delete(normalizedRiskProfileId);
    if (deleted) {
      await this.riskProfileCatalog.remove(normalizedRiskProfileId);
    }
    return Object.freeze({ riskProfileId: normalizedRiskProfileId, deleted });
  }

  async findRiskProfileByName(name: string): Promise<FindRiskProfileByNameResult> {
    const normalizedName = name.trim();
    const riskProfile = await this.riskProfileRepository.findByName(normalizedName);
    return Object.freeze({ riskProfile });
  }

  async listRiskProfilesByCategory(category: string): Promise<ListRiskProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const riskProfiles = Object.freeze(
      [...(await this.riskProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      riskProfiles,
      total: riskProfiles.length,
      category: normalizedCategory,
    });
  }

  async getRiskProfileRegistryStatistics(): Promise<RiskProfileRegistryStatistics> {
    const riskProfiles = await this.riskProfileRepository.findAll();
    const activeRiskProfiles = riskProfiles.filter(
      (riskProfile) => riskProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(riskProfiles.map((riskProfile) => riskProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalRiskProfiles: riskProfiles.length,
      activeRiskProfiles,
      categories,
    });
  }

  async serializeRiskProfile(riskProfile: RiskProfile): Promise<string> {
    return this.riskProfileSerializer.serialize(riskProfile);
  }

  async deserializeRiskProfile(serialized: string): Promise<RiskProfile> {
    return this.riskProfileSerializer.deserialize(serialized);
  }
}
