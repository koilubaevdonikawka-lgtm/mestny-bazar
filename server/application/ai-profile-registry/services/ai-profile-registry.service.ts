/**
 * AI Profile Registry — unified registry for AI profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IProfileCatalog } from "@server/application/ai-profile-registry/contracts/profile-catalog.contract";
import type { IProfileRepository } from "@server/application/ai-profile-registry/contracts/profile-repository.contract";
import type { IProfileSerializer } from "@server/application/ai-profile-registry/contracts/profile-serializer.contract";
import type { IProfileStatisticsProvider } from "@server/application/ai-profile-registry/contracts/profile-statistics-provider.contract";
import type { IProfileValidator } from "@server/application/ai-profile-registry/contracts/profile-validator.contract";
import {
  createProfile,
  type DeleteProfileResult,
  type FindProfileByNameResult,
  type ListProfilesByTypeResult,
  type ListProfilesResult,
  type Profile,
  type ProfileRegistryStatistics,
  type RegisterProfileInput,
  type UpdateProfileInput,
} from "@server/application/ai-profile-registry/models/profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiProfileRegistryService {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly profileCatalog: IProfileCatalog,
    private readonly profileValidator: IProfileValidator,
    private readonly profileSerializer: IProfileSerializer,
    private readonly statisticsProvider: IProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerProfile(input: RegisterProfileInput): Promise<Profile> {
    const validation = await this.profileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.profileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Profile already exists with name: ${input.name.trim()}`);
    }

    const profile = createProfile({
      profileId: this.idGenerator.generate(),
      name: input.name,
      type: input.type,
      description: input.description,
      configuration: input.configuration,
      status: input.status,
    });

    await this.profileRepository.save(profile);
    await this.profileCatalog.register(profile);
    return profile;
  }

  async getProfile(profileId: string): Promise<Profile | null> {
    return this.profileRepository.findById(profileId.trim());
  }

  async listProfiles(): Promise<ListProfilesResult> {
    const profiles = Object.freeze(
      [...(await this.profileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ profiles, total: profiles.length });
  }

  async updateProfile(input: UpdateProfileInput): Promise<Profile> {
    const profileId = input.profileId.trim();
    const existing = await this.profileRepository.findById(profileId);
    if (!existing) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    const validation = await this.profileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.profileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.profileId !== existing.profileId) {
        throw new Error(`Profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createProfile({
      profileId: existing.profileId,
      name: input.name?.trim() ?? existing.name,
      type: input.type?.trim() ?? existing.type,
      description: input.description ?? existing.description,
      configuration: input.configuration ?? existing.configuration,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.profileRepository.save(updated);
    await this.profileCatalog.register(updated);
    return updated;
  }

  async deleteProfile(profileId: string): Promise<DeleteProfileResult> {
    const normalizedProfileId = profileId.trim();
    const deleted = await this.profileRepository.delete(normalizedProfileId);
    if (deleted) {
      await this.profileCatalog.remove(normalizedProfileId);
    }
    return Object.freeze({ profileId: normalizedProfileId, deleted });
  }

  async findProfileByName(name: string): Promise<FindProfileByNameResult> {
    const normalizedName = name.trim();
    const profile = await this.profileRepository.findByName(normalizedName);
    return Object.freeze({ profile });
  }

  async listProfilesByType(type: string): Promise<ListProfilesByTypeResult> {
    const normalizedType = type.trim();
    const profiles = Object.freeze(
      [...(await this.profileRepository.findByType(normalizedType))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      profiles,
      total: profiles.length,
      type: normalizedType,
    });
  }

  async getProfileRegistryStatistics(): Promise<ProfileRegistryStatistics> {
    const profiles = await this.profileRepository.findAll();
    const activeProfiles = profiles.filter((profile) => profile.status === "active").length;
    const types = Object.freeze([
      ...new Set(profiles.map((profile) => profile.type)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalProfiles: profiles.length,
      activeProfiles,
      types,
    });
  }

  async serializeProfile(profile: Profile): Promise<string> {
    return this.profileSerializer.serialize(profile);
  }

  async deserializeProfile(serialized: string): Promise<Profile> {
    return this.profileSerializer.deserialize(serialized);
  }
}
