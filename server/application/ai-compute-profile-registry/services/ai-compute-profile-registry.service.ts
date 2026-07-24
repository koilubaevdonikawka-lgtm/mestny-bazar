/**
 * AI Compute Profile Registry — unified registry for AI compute profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IComputeProfileCatalog } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-catalog.contract";
import type { IComputeProfileRepository } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-repository.contract";
import type { IComputeProfileSerializer } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-serializer.contract";
import type { IComputeProfileStatisticsProvider } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-statistics-provider.contract";
import type { IComputeProfileValidator } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-validator.contract";
import {
  createComputeProfile,
  type ComputeProfile,
  type ComputeProfileRegistryStatistics,
  type DeleteComputeProfileResult,
  type FindComputeProfileByNameResult,
  type ListComputeProfilesByCategoryResult,
  type ListComputeProfilesResult,
  type RegisterComputeProfileInput,
  type UpdateComputeProfileInput,
} from "@server/application/ai-compute-profile-registry/models/compute-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiComputeProfileRegistryService {
  constructor(
    private readonly computeProfileRepository: IComputeProfileRepository,
    private readonly computeProfileCatalog: IComputeProfileCatalog,
    private readonly computeProfileValidator: IComputeProfileValidator,
    private readonly computeProfileSerializer: IComputeProfileSerializer,
    private readonly statisticsProvider: IComputeProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerComputeProfile(input: RegisterComputeProfileInput): Promise<ComputeProfile> {
    const validation = await this.computeProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.computeProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Compute profile already exists with name: ${input.name.trim()}`);
    }

    const computeProfile = createComputeProfile({
      computeProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.computeProfileRepository.save(computeProfile);
    await this.computeProfileCatalog.register(computeProfile);
    return computeProfile;
  }

  async getComputeProfile(computeProfileId: string): Promise<ComputeProfile | null> {
    return this.computeProfileRepository.findById(computeProfileId.trim());
  }

  async listComputeProfiles(): Promise<ListComputeProfilesResult> {
    const computeProfiles = Object.freeze(
      [...(await this.computeProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ computeProfiles, total: computeProfiles.length });
  }

  async updateComputeProfile(input: UpdateComputeProfileInput): Promise<ComputeProfile> {
    const computeProfileId = input.computeProfileId.trim();
    const existing = await this.computeProfileRepository.findById(computeProfileId);
    if (!existing) {
      throw new Error(`Compute profile not found: ${computeProfileId}`);
    }

    const validation = await this.computeProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.computeProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.computeProfileId !== existing.computeProfileId) {
        throw new Error(`Compute profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createComputeProfile({
      computeProfileId: existing.computeProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.computeProfileRepository.save(updated);
    await this.computeProfileCatalog.register(updated);
    return updated;
  }

  async deleteComputeProfile(computeProfileId: string): Promise<DeleteComputeProfileResult> {
    const normalizedComputeProfileId = computeProfileId.trim();
    const deleted = await this.computeProfileRepository.delete(normalizedComputeProfileId);
    if (deleted) {
      await this.computeProfileCatalog.remove(normalizedComputeProfileId);
    }
    return Object.freeze({ computeProfileId: normalizedComputeProfileId, deleted });
  }

  async findComputeProfileByName(name: string): Promise<FindComputeProfileByNameResult> {
    const normalizedName = name.trim();
    const computeProfile = await this.computeProfileRepository.findByName(normalizedName);
    return Object.freeze({ computeProfile });
  }

  async listComputeProfilesByCategory(category: string): Promise<ListComputeProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const computeProfiles = Object.freeze(
      [...(await this.computeProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      computeProfiles,
      total: computeProfiles.length,
      category: normalizedCategory,
    });
  }

  async getComputeProfileRegistryStatistics(): Promise<ComputeProfileRegistryStatistics> {
    const computeProfiles = await this.computeProfileRepository.findAll();
    const activeComputeProfiles = computeProfiles.filter(
      (computeProfile) => computeProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(computeProfiles.map((computeProfile) => computeProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalComputeProfiles: computeProfiles.length,
      activeComputeProfiles,
      categories,
    });
  }

  async serializeComputeProfile(computeProfile: ComputeProfile): Promise<string> {
    return this.computeProfileSerializer.serialize(computeProfile);
  }

  async deserializeComputeProfile(serialized: string): Promise<ComputeProfile> {
    return this.computeProfileSerializer.deserialize(serialized);
  }
}
