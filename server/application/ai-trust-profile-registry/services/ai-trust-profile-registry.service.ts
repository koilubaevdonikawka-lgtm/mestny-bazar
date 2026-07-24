/**
 * AI Trust Profile Registry — unified registry for AI trust profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ITrustProfileCatalog } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-catalog.contract";
import type { ITrustProfileRepository } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-repository.contract";
import type { ITrustProfileSerializer } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-serializer.contract";
import type { ITrustProfileStatisticsProvider } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-statistics-provider.contract";
import type { ITrustProfileValidator } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-validator.contract";
import {
  createTrustProfile,
  type DeleteTrustProfileResult,
  type FindTrustProfileByNameResult,
  type TrustProfile,
  type TrustProfileRegistryStatistics,
  type ListTrustProfilesByCategoryResult,
  type ListTrustProfilesResult,
  type RegisterTrustProfileInput,
  type UpdateTrustProfileInput,
} from "@server/application/ai-trust-profile-registry/models/trust-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiTrustProfileRegistryService {
  constructor(
    private readonly trustProfileRepository: ITrustProfileRepository,
    private readonly trustProfileCatalog: ITrustProfileCatalog,
    private readonly trustProfileValidator: ITrustProfileValidator,
    private readonly trustProfileSerializer: ITrustProfileSerializer,
    private readonly statisticsProvider: ITrustProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerTrustProfile(input: RegisterTrustProfileInput): Promise<TrustProfile> {
    const validation = await this.trustProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.trustProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Trust profile already exists with name: ${input.name.trim()}`);
    }

    const trustProfile = createTrustProfile({
      trustProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.trustProfileRepository.save(trustProfile);
    await this.trustProfileCatalog.register(trustProfile);
    return trustProfile;
  }

  async getTrustProfile(trustProfileId: string): Promise<TrustProfile | null> {
    return this.trustProfileRepository.findById(trustProfileId.trim());
  }

  async listTrustProfiles(): Promise<ListTrustProfilesResult> {
    const trustProfiles = Object.freeze(
      [...(await this.trustProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ trustProfiles, total: trustProfiles.length });
  }

  async updateTrustProfile(input: UpdateTrustProfileInput): Promise<TrustProfile> {
    const trustProfileId = input.trustProfileId.trim();
    const existing = await this.trustProfileRepository.findById(trustProfileId);
    if (!existing) {
      throw new Error(`Trust profile not found: ${trustProfileId}`);
    }

    const validation = await this.trustProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.trustProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.trustProfileId !== existing.trustProfileId) {
        throw new Error(`Trust profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createTrustProfile({
      trustProfileId: existing.trustProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.trustProfileRepository.save(updated);
    await this.trustProfileCatalog.register(updated);
    return updated;
  }

  async deleteTrustProfile(trustProfileId: string): Promise<DeleteTrustProfileResult> {
    const normalizedTrustProfileId = trustProfileId.trim();
    const deleted = await this.trustProfileRepository.delete(normalizedTrustProfileId);
    if (deleted) {
      await this.trustProfileCatalog.remove(normalizedTrustProfileId);
    }
    return Object.freeze({ trustProfileId: normalizedTrustProfileId, deleted });
  }

  async findTrustProfileByName(name: string): Promise<FindTrustProfileByNameResult> {
    const normalizedName = name.trim();
    const trustProfile = await this.trustProfileRepository.findByName(normalizedName);
    return Object.freeze({ trustProfile });
  }

  async listTrustProfilesByCategory(category: string): Promise<ListTrustProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const trustProfiles = Object.freeze(
      [...(await this.trustProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      trustProfiles,
      total: trustProfiles.length,
      category: normalizedCategory,
    });
  }

  async getTrustProfileRegistryStatistics(): Promise<TrustProfileRegistryStatistics> {
    const trustProfiles = await this.trustProfileRepository.findAll();
    const activeTrustProfiles = trustProfiles.filter(
      (trustProfile) => trustProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(trustProfiles.map((trustProfile) => trustProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalTrustProfiles: trustProfiles.length,
      activeTrustProfiles,
      categories,
    });
  }

  async serializeTrustProfile(trustProfile: TrustProfile): Promise<string> {
    return this.trustProfileSerializer.serialize(trustProfile);
  }

  async deserializeTrustProfile(serialized: string): Promise<TrustProfile> {
    return this.trustProfileSerializer.deserialize(serialized);
  }
}
