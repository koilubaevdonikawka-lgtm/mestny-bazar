/**
 * AI Reliability Profile Registry — unified registry for AI reliability profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IReliabilityProfileCatalog } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-catalog.contract";
import type { IReliabilityProfileRepository } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-repository.contract";
import type { IReliabilityProfileSerializer } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-serializer.contract";
import type { IReliabilityProfileStatisticsProvider } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-statistics-provider.contract";
import type { IReliabilityProfileValidator } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-validator.contract";
import {
  createReliabilityProfile,
  type DeleteReliabilityProfileResult,
  type FindReliabilityProfileByNameResult,
  type ReliabilityProfile,
  type ReliabilityProfileRegistryStatistics,
  type ListReliabilityProfilesByCategoryResult,
  type ListReliabilityProfilesResult,
  type RegisterReliabilityProfileInput,
  type UpdateReliabilityProfileInput,
} from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiReliabilityProfileRegistryService {
  constructor(
    private readonly reliabilityProfileRepository: IReliabilityProfileRepository,
    private readonly reliabilityProfileCatalog: IReliabilityProfileCatalog,
    private readonly reliabilityProfileValidator: IReliabilityProfileValidator,
    private readonly reliabilityProfileSerializer: IReliabilityProfileSerializer,
    private readonly statisticsProvider: IReliabilityProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerReliabilityProfile(input: RegisterReliabilityProfileInput): Promise<ReliabilityProfile> {
    const validation = await this.reliabilityProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.reliabilityProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Reliability profile already exists with name: ${input.name.trim()}`);
    }

    const reliabilityProfile = createReliabilityProfile({
      reliabilityProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.reliabilityProfileRepository.save(reliabilityProfile);
    await this.reliabilityProfileCatalog.register(reliabilityProfile);
    return reliabilityProfile;
  }

  async getReliabilityProfile(reliabilityProfileId: string): Promise<ReliabilityProfile | null> {
    return this.reliabilityProfileRepository.findById(reliabilityProfileId.trim());
  }

  async listReliabilityProfiles(): Promise<ListReliabilityProfilesResult> {
    const reliabilityProfiles = Object.freeze(
      [...(await this.reliabilityProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ reliabilityProfiles, total: reliabilityProfiles.length });
  }

  async updateReliabilityProfile(input: UpdateReliabilityProfileInput): Promise<ReliabilityProfile> {
    const reliabilityProfileId = input.reliabilityProfileId.trim();
    const existing = await this.reliabilityProfileRepository.findById(reliabilityProfileId);
    if (!existing) {
      throw new Error(`Reliability profile not found: ${reliabilityProfileId}`);
    }

    const validation = await this.reliabilityProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.reliabilityProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.reliabilityProfileId !== existing.reliabilityProfileId) {
        throw new Error(`Reliability profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createReliabilityProfile({
      reliabilityProfileId: existing.reliabilityProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.reliabilityProfileRepository.save(updated);
    await this.reliabilityProfileCatalog.register(updated);
    return updated;
  }

  async deleteReliabilityProfile(reliabilityProfileId: string): Promise<DeleteReliabilityProfileResult> {
    const normalizedReliabilityProfileId = reliabilityProfileId.trim();
    const deleted = await this.reliabilityProfileRepository.delete(normalizedReliabilityProfileId);
    if (deleted) {
      await this.reliabilityProfileCatalog.remove(normalizedReliabilityProfileId);
    }
    return Object.freeze({ reliabilityProfileId: normalizedReliabilityProfileId, deleted });
  }

  async findReliabilityProfileByName(name: string): Promise<FindReliabilityProfileByNameResult> {
    const normalizedName = name.trim();
    const reliabilityProfile = await this.reliabilityProfileRepository.findByName(normalizedName);
    return Object.freeze({ reliabilityProfile });
  }

  async listReliabilityProfilesByCategory(category: string): Promise<ListReliabilityProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const reliabilityProfiles = Object.freeze(
      [...(await this.reliabilityProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      reliabilityProfiles,
      total: reliabilityProfiles.length,
      category: normalizedCategory,
    });
  }

  async getReliabilityProfileRegistryStatistics(): Promise<ReliabilityProfileRegistryStatistics> {
    const reliabilityProfiles = await this.reliabilityProfileRepository.findAll();
    const activeReliabilityProfiles = reliabilityProfiles.filter(
      (reliabilityProfile) => reliabilityProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(reliabilityProfiles.map((reliabilityProfile) => reliabilityProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalReliabilityProfiles: reliabilityProfiles.length,
      activeReliabilityProfiles,
      categories,
    });
  }

  async serializeReliabilityProfile(reliabilityProfile: ReliabilityProfile): Promise<string> {
    return this.reliabilityProfileSerializer.serialize(reliabilityProfile);
  }

  async deserializeReliabilityProfile(serialized: string): Promise<ReliabilityProfile> {
    return this.reliabilityProfileSerializer.deserialize(serialized);
  }
}
