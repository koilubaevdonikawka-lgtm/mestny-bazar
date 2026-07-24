/**
 * AI Policy Profile Registry — unified registry for AI policy profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IPolicyProfileCatalog } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-catalog.contract";
import type { IPolicyProfileRepository } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-repository.contract";
import type { IPolicyProfileSerializer } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-serializer.contract";
import type { IPolicyProfileStatisticsProvider } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-statistics-provider.contract";
import type { IPolicyProfileValidator } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-validator.contract";
import {
  createPolicyProfile,
  type DeletePolicyProfileResult,
  type FindPolicyProfileByNameResult,
  type PolicyProfile,
  type PolicyProfileRegistryStatistics,
  type ListPolicyProfilesByCategoryResult,
  type ListPolicyProfilesResult,
  type RegisterPolicyProfileInput,
  type UpdatePolicyProfileInput,
} from "@server/application/ai-policy-profile-registry/models/policy-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiPolicyProfileRegistryService {
  constructor(
    private readonly policyProfileRepository: IPolicyProfileRepository,
    private readonly policyProfileCatalog: IPolicyProfileCatalog,
    private readonly policyProfileValidator: IPolicyProfileValidator,
    private readonly policyProfileSerializer: IPolicyProfileSerializer,
    private readonly statisticsProvider: IPolicyProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerPolicyProfile(input: RegisterPolicyProfileInput): Promise<PolicyProfile> {
    const validation = await this.policyProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.policyProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Policy profile already exists with name: ${input.name.trim()}`);
    }

    const policyProfile = createPolicyProfile({
      policyProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.policyProfileRepository.save(policyProfile);
    await this.policyProfileCatalog.register(policyProfile);
    return policyProfile;
  }

  async getPolicyProfile(policyProfileId: string): Promise<PolicyProfile | null> {
    return this.policyProfileRepository.findById(policyProfileId.trim());
  }

  async listPolicyProfiles(): Promise<ListPolicyProfilesResult> {
    const policyProfiles = Object.freeze(
      [...(await this.policyProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ policyProfiles, total: policyProfiles.length });
  }

  async updatePolicyProfile(input: UpdatePolicyProfileInput): Promise<PolicyProfile> {
    const policyProfileId = input.policyProfileId.trim();
    const existing = await this.policyProfileRepository.findById(policyProfileId);
    if (!existing) {
      throw new Error(`Policy profile not found: ${policyProfileId}`);
    }

    const validation = await this.policyProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.policyProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.policyProfileId !== existing.policyProfileId) {
        throw new Error(`Policy profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createPolicyProfile({
      policyProfileId: existing.policyProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.policyProfileRepository.save(updated);
    await this.policyProfileCatalog.register(updated);
    return updated;
  }

  async deletePolicyProfile(policyProfileId: string): Promise<DeletePolicyProfileResult> {
    const normalizedPolicyProfileId = policyProfileId.trim();
    const deleted = await this.policyProfileRepository.delete(normalizedPolicyProfileId);
    if (deleted) {
      await this.policyProfileCatalog.remove(normalizedPolicyProfileId);
    }
    return Object.freeze({ policyProfileId: normalizedPolicyProfileId, deleted });
  }

  async findPolicyProfileByName(name: string): Promise<FindPolicyProfileByNameResult> {
    const normalizedName = name.trim();
    const policyProfile = await this.policyProfileRepository.findByName(normalizedName);
    return Object.freeze({ policyProfile });
  }

  async listPolicyProfilesByCategory(category: string): Promise<ListPolicyProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const policyProfiles = Object.freeze(
      [...(await this.policyProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      policyProfiles,
      total: policyProfiles.length,
      category: normalizedCategory,
    });
  }

  async getPolicyProfileRegistryStatistics(): Promise<PolicyProfileRegistryStatistics> {
    const policyProfiles = await this.policyProfileRepository.findAll();
    const activePolicyProfiles = policyProfiles.filter(
      (policyProfile) => policyProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(policyProfiles.map((policyProfile) => policyProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalPolicyProfiles: policyProfiles.length,
      activePolicyProfiles,
      categories,
    });
  }

  async serializePolicyProfile(policyProfile: PolicyProfile): Promise<string> {
    return this.policyProfileSerializer.serialize(policyProfile);
  }

  async deserializePolicyProfile(serialized: string): Promise<PolicyProfile> {
    return this.policyProfileSerializer.deserialize(serialized);
  }
}
