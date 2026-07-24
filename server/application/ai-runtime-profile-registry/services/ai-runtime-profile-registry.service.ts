/**
 * AI Runtime Profile Registry — unified registry for AI runtime profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IRuntimeProfileCatalog } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-catalog.contract";
import type { IRuntimeProfileRepository } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-repository.contract";
import type { IRuntimeProfileSerializer } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-serializer.contract";
import type { IRuntimeProfileStatisticsProvider } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-statistics-provider.contract";
import type { IRuntimeProfileValidator } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-validator.contract";
import {
  createRuntimeProfile,
  type DeleteRuntimeProfileResult,
  type FindRuntimeProfileByNameResult,
  type ListRuntimeProfilesByCategoryResult,
  type ListRuntimeProfilesResult,
  type RegisterRuntimeProfileInput,
  type RuntimeProfile,
  type RuntimeProfileRegistryStatistics,
  type UpdateRuntimeProfileInput,
} from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiRuntimeProfileRegistryService {
  constructor(
    private readonly runtimeProfileRepository: IRuntimeProfileRepository,
    private readonly runtimeProfileCatalog: IRuntimeProfileCatalog,
    private readonly runtimeProfileValidator: IRuntimeProfileValidator,
    private readonly runtimeProfileSerializer: IRuntimeProfileSerializer,
    private readonly statisticsProvider: IRuntimeProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerRuntimeProfile(input: RegisterRuntimeProfileInput): Promise<RuntimeProfile> {
    const validation = await this.runtimeProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.runtimeProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Runtime profile already exists with name: ${input.name.trim()}`);
    }

    const runtimeProfile = createRuntimeProfile({
      runtimeProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.runtimeProfileRepository.save(runtimeProfile);
    await this.runtimeProfileCatalog.register(runtimeProfile);
    return runtimeProfile;
  }

  async getRuntimeProfile(runtimeProfileId: string): Promise<RuntimeProfile | null> {
    return this.runtimeProfileRepository.findById(runtimeProfileId.trim());
  }

  async listRuntimeProfiles(): Promise<ListRuntimeProfilesResult> {
    const runtimeProfiles = Object.freeze(
      [...(await this.runtimeProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ runtimeProfiles, total: runtimeProfiles.length });
  }

  async updateRuntimeProfile(input: UpdateRuntimeProfileInput): Promise<RuntimeProfile> {
    const runtimeProfileId = input.runtimeProfileId.trim();
    const existing = await this.runtimeProfileRepository.findById(runtimeProfileId);
    if (!existing) {
      throw new Error(`Runtime profile not found: ${runtimeProfileId}`);
    }

    const validation = await this.runtimeProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.runtimeProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.runtimeProfileId !== existing.runtimeProfileId) {
        throw new Error(`Runtime profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createRuntimeProfile({
      runtimeProfileId: existing.runtimeProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.runtimeProfileRepository.save(updated);
    await this.runtimeProfileCatalog.register(updated);
    return updated;
  }

  async deleteRuntimeProfile(runtimeProfileId: string): Promise<DeleteRuntimeProfileResult> {
    const normalizedRuntimeProfileId = runtimeProfileId.trim();
    const deleted = await this.runtimeProfileRepository.delete(normalizedRuntimeProfileId);
    if (deleted) {
      await this.runtimeProfileCatalog.remove(normalizedRuntimeProfileId);
    }
    return Object.freeze({ runtimeProfileId: normalizedRuntimeProfileId, deleted });
  }

  async findRuntimeProfileByName(name: string): Promise<FindRuntimeProfileByNameResult> {
    const normalizedName = name.trim();
    const runtimeProfile = await this.runtimeProfileRepository.findByName(normalizedName);
    return Object.freeze({ runtimeProfile });
  }

  async listRuntimeProfilesByCategory(category: string): Promise<ListRuntimeProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const runtimeProfiles = Object.freeze(
      [...(await this.runtimeProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      runtimeProfiles,
      total: runtimeProfiles.length,
      category: normalizedCategory,
    });
  }

  async getRuntimeProfileRegistryStatistics(): Promise<RuntimeProfileRegistryStatistics> {
    const runtimeProfiles = await this.runtimeProfileRepository.findAll();
    const activeRuntimeProfiles = runtimeProfiles.filter(
      (runtimeProfile) => runtimeProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(runtimeProfiles.map((runtimeProfile) => runtimeProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalRuntimeProfiles: runtimeProfiles.length,
      activeRuntimeProfiles,
      categories,
    });
  }

  async serializeRuntimeProfile(runtimeProfile: RuntimeProfile): Promise<string> {
    return this.runtimeProfileSerializer.serialize(runtimeProfile);
  }

  async deserializeRuntimeProfile(serialized: string): Promise<RuntimeProfile> {
    return this.runtimeProfileSerializer.deserialize(serialized);
  }
}
