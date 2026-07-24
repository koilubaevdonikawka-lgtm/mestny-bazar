/**
 * AI Memory Profile Registry — unified registry for AI memory profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IMemoryProfileCatalog } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-catalog.contract";
import type { IMemoryProfileRepository } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-repository.contract";
import type { IMemoryProfileSerializer } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-serializer.contract";
import type { IMemoryProfileStatisticsProvider } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-statistics-provider.contract";
import type { IMemoryProfileValidator } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-validator.contract";
import {
  createMemoryProfile,
  type DeleteMemoryProfileResult,
  type FindMemoryProfileByNameResult,
  type MemoryProfile,
  type MemoryProfileRegistryStatistics,
  type ListMemoryProfilesByCategoryResult,
  type ListMemoryProfilesResult,
  type RegisterMemoryProfileInput,
  type UpdateMemoryProfileInput,
} from "@server/application/ai-memory-profile-registry/models/memory-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiMemoryProfileRegistryService {
  constructor(
    private readonly memoryProfileRepository: IMemoryProfileRepository,
    private readonly memoryProfileCatalog: IMemoryProfileCatalog,
    private readonly memoryProfileValidator: IMemoryProfileValidator,
    private readonly memoryProfileSerializer: IMemoryProfileSerializer,
    private readonly statisticsProvider: IMemoryProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerMemoryProfile(input: RegisterMemoryProfileInput): Promise<MemoryProfile> {
    const validation = await this.memoryProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.memoryProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Memory profile already exists with name: ${input.name.trim()}`);
    }

    const memoryProfile = createMemoryProfile({
      memoryProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.memoryProfileRepository.save(memoryProfile);
    await this.memoryProfileCatalog.register(memoryProfile);
    return memoryProfile;
  }

  async getMemoryProfile(memoryProfileId: string): Promise<MemoryProfile | null> {
    return this.memoryProfileRepository.findById(memoryProfileId.trim());
  }

  async listMemoryProfiles(): Promise<ListMemoryProfilesResult> {
    const memoryProfiles = Object.freeze(
      [...(await this.memoryProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ memoryProfiles, total: memoryProfiles.length });
  }

  async updateMemoryProfile(input: UpdateMemoryProfileInput): Promise<MemoryProfile> {
    const memoryProfileId = input.memoryProfileId.trim();
    const existing = await this.memoryProfileRepository.findById(memoryProfileId);
    if (!existing) {
      throw new Error(`Memory profile not found: ${memoryProfileId}`);
    }

    const validation = await this.memoryProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.memoryProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.memoryProfileId !== existing.memoryProfileId) {
        throw new Error(`Memory profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createMemoryProfile({
      memoryProfileId: existing.memoryProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.memoryProfileRepository.save(updated);
    await this.memoryProfileCatalog.register(updated);
    return updated;
  }

  async deleteMemoryProfile(memoryProfileId: string): Promise<DeleteMemoryProfileResult> {
    const normalizedMemoryProfileId = memoryProfileId.trim();
    const deleted = await this.memoryProfileRepository.delete(normalizedMemoryProfileId);
    if (deleted) {
      await this.memoryProfileCatalog.remove(normalizedMemoryProfileId);
    }
    return Object.freeze({ memoryProfileId: normalizedMemoryProfileId, deleted });
  }

  async findMemoryProfileByName(name: string): Promise<FindMemoryProfileByNameResult> {
    const normalizedName = name.trim();
    const memoryProfile = await this.memoryProfileRepository.findByName(normalizedName);
    return Object.freeze({ memoryProfile });
  }

  async listMemoryProfilesByCategory(category: string): Promise<ListMemoryProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const memoryProfiles = Object.freeze(
      [...(await this.memoryProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      memoryProfiles,
      total: memoryProfiles.length,
      category: normalizedCategory,
    });
  }

  async getMemoryProfileRegistryStatistics(): Promise<MemoryProfileRegistryStatistics> {
    const memoryProfiles = await this.memoryProfileRepository.findAll();
    const activeMemoryProfiles = memoryProfiles.filter(
      (memoryProfile) => memoryProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(memoryProfiles.map((memoryProfile) => memoryProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalMemoryProfiles: memoryProfiles.length,
      activeMemoryProfiles,
      categories,
    });
  }

  async serializeMemoryProfile(memoryProfile: MemoryProfile): Promise<string> {
    return this.memoryProfileSerializer.serialize(memoryProfile);
  }

  async deserializeMemoryProfile(serialized: string): Promise<MemoryProfile> {
    return this.memoryProfileSerializer.deserialize(serialized);
  }
}
