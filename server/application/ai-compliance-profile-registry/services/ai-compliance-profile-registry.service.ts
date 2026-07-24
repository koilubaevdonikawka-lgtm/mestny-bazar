/**
 * AI Compliance Profile Registry — unified registry for AI compliance profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IComplianceProfileCatalog } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-catalog.contract";
import type { IComplianceProfileRepository } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-repository.contract";
import type { IComplianceProfileSerializer } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-serializer.contract";
import type { IComplianceProfileStatisticsProvider } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-statistics-provider.contract";
import type { IComplianceProfileValidator } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-validator.contract";
import {
  createComplianceProfile,
  type DeleteComplianceProfileResult,
  type FindComplianceProfileByNameResult,
  type ComplianceProfile,
  type ComplianceProfileRegistryStatistics,
  type ListComplianceProfilesByCategoryResult,
  type ListComplianceProfilesResult,
  type RegisterComplianceProfileInput,
  type UpdateComplianceProfileInput,
} from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiComplianceProfileRegistryService {
  constructor(
    private readonly complianceProfileRepository: IComplianceProfileRepository,
    private readonly complianceProfileCatalog: IComplianceProfileCatalog,
    private readonly complianceProfileValidator: IComplianceProfileValidator,
    private readonly complianceProfileSerializer: IComplianceProfileSerializer,
    private readonly statisticsProvider: IComplianceProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerComplianceProfile(input: RegisterComplianceProfileInput): Promise<ComplianceProfile> {
    const validation = await this.complianceProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.complianceProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Compliance profile already exists with name: ${input.name.trim()}`);
    }

    const complianceProfile = createComplianceProfile({
      complianceProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.complianceProfileRepository.save(complianceProfile);
    await this.complianceProfileCatalog.register(complianceProfile);
    return complianceProfile;
  }

  async getComplianceProfile(complianceProfileId: string): Promise<ComplianceProfile | null> {
    return this.complianceProfileRepository.findById(complianceProfileId.trim());
  }

  async listComplianceProfiles(): Promise<ListComplianceProfilesResult> {
    const complianceProfiles = Object.freeze(
      [...(await this.complianceProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ complianceProfiles, total: complianceProfiles.length });
  }

  async updateComplianceProfile(input: UpdateComplianceProfileInput): Promise<ComplianceProfile> {
    const complianceProfileId = input.complianceProfileId.trim();
    const existing = await this.complianceProfileRepository.findById(complianceProfileId);
    if (!existing) {
      throw new Error(`Compliance profile not found: ${complianceProfileId}`);
    }

    const validation = await this.complianceProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.complianceProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.complianceProfileId !== existing.complianceProfileId) {
        throw new Error(`Compliance profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createComplianceProfile({
      complianceProfileId: existing.complianceProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.complianceProfileRepository.save(updated);
    await this.complianceProfileCatalog.register(updated);
    return updated;
  }

  async deleteComplianceProfile(complianceProfileId: string): Promise<DeleteComplianceProfileResult> {
    const normalizedComplianceProfileId = complianceProfileId.trim();
    const deleted = await this.complianceProfileRepository.delete(normalizedComplianceProfileId);
    if (deleted) {
      await this.complianceProfileCatalog.remove(normalizedComplianceProfileId);
    }
    return Object.freeze({ complianceProfileId: normalizedComplianceProfileId, deleted });
  }

  async findComplianceProfileByName(name: string): Promise<FindComplianceProfileByNameResult> {
    const normalizedName = name.trim();
    const complianceProfile = await this.complianceProfileRepository.findByName(normalizedName);
    return Object.freeze({ complianceProfile });
  }

  async listComplianceProfilesByCategory(category: string): Promise<ListComplianceProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const complianceProfiles = Object.freeze(
      [...(await this.complianceProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      complianceProfiles,
      total: complianceProfiles.length,
      category: normalizedCategory,
    });
  }

  async getComplianceProfileRegistryStatistics(): Promise<ComplianceProfileRegistryStatistics> {
    const complianceProfiles = await this.complianceProfileRepository.findAll();
    const activeComplianceProfiles = complianceProfiles.filter(
      (complianceProfile) => complianceProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(complianceProfiles.map((complianceProfile) => complianceProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalComplianceProfiles: complianceProfiles.length,
      activeComplianceProfiles,
      categories,
    });
  }

  async serializeComplianceProfile(complianceProfile: ComplianceProfile): Promise<string> {
    return this.complianceProfileSerializer.serialize(complianceProfile);
  }

  async deserializeComplianceProfile(serialized: string): Promise<ComplianceProfile> {
    return this.complianceProfileSerializer.deserialize(serialized);
  }
}
