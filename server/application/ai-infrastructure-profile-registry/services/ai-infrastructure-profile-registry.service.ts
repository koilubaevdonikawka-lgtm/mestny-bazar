/**
 * AI Infrastructure Profile Registry — unified registry for AI infrastructure profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IInfrastructureProfileCatalog } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-catalog.contract";
import type { IInfrastructureProfileRepository } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-repository.contract";
import type { IInfrastructureProfileSerializer } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-serializer.contract";
import type { IInfrastructureProfileStatisticsProvider } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-statistics-provider.contract";
import type { IInfrastructureProfileValidator } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-validator.contract";
import {
  createInfrastructureProfile,
  type DeleteInfrastructureProfileResult,
  type FindInfrastructureProfileByNameResult,
  type InfrastructureProfile,
  type InfrastructureProfileRegistryStatistics,
  type ListInfrastructureProfilesByCategoryResult,
  type ListInfrastructureProfilesResult,
  type RegisterInfrastructureProfileInput,
  type UpdateInfrastructureProfileInput,
} from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiInfrastructureProfileRegistryService {
  constructor(
    private readonly infrastructureProfileRepository: IInfrastructureProfileRepository,
    private readonly infrastructureProfileCatalog: IInfrastructureProfileCatalog,
    private readonly infrastructureProfileValidator: IInfrastructureProfileValidator,
    private readonly infrastructureProfileSerializer: IInfrastructureProfileSerializer,
    private readonly statisticsProvider: IInfrastructureProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerInfrastructureProfile(
    input: RegisterInfrastructureProfileInput,
  ): Promise<InfrastructureProfile> {
    const validation = await this.infrastructureProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.infrastructureProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Infrastructure profile already exists with name: ${input.name.trim()}`);
    }

    const infrastructureProfile = createInfrastructureProfile({
      infrastructureProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.infrastructureProfileRepository.save(infrastructureProfile);
    await this.infrastructureProfileCatalog.register(infrastructureProfile);
    return infrastructureProfile;
  }

  async getInfrastructureProfile(infrastructureProfileId: string): Promise<InfrastructureProfile | null> {
    return this.infrastructureProfileRepository.findById(infrastructureProfileId.trim());
  }

  async listInfrastructureProfiles(): Promise<ListInfrastructureProfilesResult> {
    const infrastructureProfiles = Object.freeze(
      [...(await this.infrastructureProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ infrastructureProfiles, total: infrastructureProfiles.length });
  }

  async updateInfrastructureProfile(
    input: UpdateInfrastructureProfileInput,
  ): Promise<InfrastructureProfile> {
    const infrastructureProfileId = input.infrastructureProfileId.trim();
    const existing = await this.infrastructureProfileRepository.findById(infrastructureProfileId);
    if (!existing) {
      throw new Error(`Infrastructure profile not found: ${infrastructureProfileId}`);
    }

    const validation = await this.infrastructureProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.infrastructureProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.infrastructureProfileId !== existing.infrastructureProfileId) {
        throw new Error(`Infrastructure profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createInfrastructureProfile({
      infrastructureProfileId: existing.infrastructureProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.infrastructureProfileRepository.save(updated);
    await this.infrastructureProfileCatalog.register(updated);
    return updated;
  }

  async deleteInfrastructureProfile(
    infrastructureProfileId: string,
  ): Promise<DeleteInfrastructureProfileResult> {
    const normalizedInfrastructureProfileId = infrastructureProfileId.trim();
    const deleted = await this.infrastructureProfileRepository.delete(normalizedInfrastructureProfileId);
    if (deleted) {
      await this.infrastructureProfileCatalog.remove(normalizedInfrastructureProfileId);
    }
    return Object.freeze({ infrastructureProfileId: normalizedInfrastructureProfileId, deleted });
  }

  async findInfrastructureProfileByName(
    name: string,
  ): Promise<FindInfrastructureProfileByNameResult> {
    const normalizedName = name.trim();
    const infrastructureProfile = await this.infrastructureProfileRepository.findByName(normalizedName);
    return Object.freeze({ infrastructureProfile });
  }

  async listInfrastructureProfilesByCategory(
    category: string,
  ): Promise<ListInfrastructureProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const infrastructureProfiles = Object.freeze(
      [...(await this.infrastructureProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      infrastructureProfiles,
      total: infrastructureProfiles.length,
      category: normalizedCategory,
    });
  }

  async getInfrastructureProfileRegistryStatistics(): Promise<InfrastructureProfileRegistryStatistics> {
    const infrastructureProfiles = await this.infrastructureProfileRepository.findAll();
    const activeInfrastructureProfiles = infrastructureProfiles.filter(
      (infrastructureProfile) => infrastructureProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(infrastructureProfiles.map((infrastructureProfile) => infrastructureProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalInfrastructureProfiles: infrastructureProfiles.length,
      activeInfrastructureProfiles,
      categories,
    });
  }

  async serializeInfrastructureProfile(infrastructureProfile: InfrastructureProfile): Promise<string> {
    return this.infrastructureProfileSerializer.serialize(infrastructureProfile);
  }

  async deserializeInfrastructureProfile(serialized: string): Promise<InfrastructureProfile> {
    return this.infrastructureProfileSerializer.deserialize(serialized);
  }
}
