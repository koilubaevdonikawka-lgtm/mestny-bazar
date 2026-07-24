/**
 * AI Accountability Profile Registry — unified registry for AI accountability profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IAccountabilityProfileCatalog } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-catalog.contract";
import type { IAccountabilityProfileRepository } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-repository.contract";
import type { IAccountabilityProfileSerializer } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-serializer.contract";
import type { IAccountabilityProfileStatisticsProvider } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-statistics-provider.contract";
import type { IAccountabilityProfileValidator } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-validator.contract";
import {
  createAccountabilityProfile,
  type DeleteAccountabilityProfileResult,
  type FindAccountabilityProfileByNameResult,
  type AccountabilityProfile,
  type AccountabilityProfileRegistryStatistics,
  type ListAccountabilityProfilesByCategoryResult,
  type ListAccountabilityProfilesResult,
  type RegisterAccountabilityProfileInput,
  type UpdateAccountabilityProfileInput,
} from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiAccountabilityProfileRegistryService {
  constructor(
    private readonly accountabilityProfileRepository: IAccountabilityProfileRepository,
    private readonly accountabilityProfileCatalog: IAccountabilityProfileCatalog,
    private readonly accountabilityProfileValidator: IAccountabilityProfileValidator,
    private readonly accountabilityProfileSerializer: IAccountabilityProfileSerializer,
    private readonly statisticsProvider: IAccountabilityProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerAccountabilityProfile(input: RegisterAccountabilityProfileInput): Promise<AccountabilityProfile> {
    const validation = await this.accountabilityProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.accountabilityProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Accountability profile already exists with name: ${input.name.trim()}`);
    }

    const accountabilityProfile = createAccountabilityProfile({
      accountabilityProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.accountabilityProfileRepository.save(accountabilityProfile);
    await this.accountabilityProfileCatalog.register(accountabilityProfile);
    return accountabilityProfile;
  }

  async getAccountabilityProfile(accountabilityProfileId: string): Promise<AccountabilityProfile | null> {
    return this.accountabilityProfileRepository.findById(accountabilityProfileId.trim());
  }

  async listAccountabilityProfiles(): Promise<ListAccountabilityProfilesResult> {
    const accountabilityProfiles = Object.freeze(
      [...(await this.accountabilityProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ accountabilityProfiles, total: accountabilityProfiles.length });
  }

  async updateAccountabilityProfile(input: UpdateAccountabilityProfileInput): Promise<AccountabilityProfile> {
    const accountabilityProfileId = input.accountabilityProfileId.trim();
    const existing = await this.accountabilityProfileRepository.findById(accountabilityProfileId);
    if (!existing) {
      throw new Error(`Accountability profile not found: ${accountabilityProfileId}`);
    }

    const validation = await this.accountabilityProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.accountabilityProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.accountabilityProfileId !== existing.accountabilityProfileId) {
        throw new Error(`Accountability profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createAccountabilityProfile({
      accountabilityProfileId: existing.accountabilityProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.accountabilityProfileRepository.save(updated);
    await this.accountabilityProfileCatalog.register(updated);
    return updated;
  }

  async deleteAccountabilityProfile(accountabilityProfileId: string): Promise<DeleteAccountabilityProfileResult> {
    const normalizedAccountabilityProfileId = accountabilityProfileId.trim();
    const deleted = await this.accountabilityProfileRepository.delete(normalizedAccountabilityProfileId);
    if (deleted) {
      await this.accountabilityProfileCatalog.remove(normalizedAccountabilityProfileId);
    }
    return Object.freeze({ accountabilityProfileId: normalizedAccountabilityProfileId, deleted });
  }

  async findAccountabilityProfileByName(name: string): Promise<FindAccountabilityProfileByNameResult> {
    const normalizedName = name.trim();
    const accountabilityProfile = await this.accountabilityProfileRepository.findByName(normalizedName);
    return Object.freeze({ accountabilityProfile });
  }

  async listAccountabilityProfilesByCategory(category: string): Promise<ListAccountabilityProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const accountabilityProfiles = Object.freeze(
      [...(await this.accountabilityProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      accountabilityProfiles,
      total: accountabilityProfiles.length,
      category: normalizedCategory,
    });
  }

  async getAccountabilityProfileRegistryStatistics(): Promise<AccountabilityProfileRegistryStatistics> {
    const accountabilityProfiles = await this.accountabilityProfileRepository.findAll();
    const activeAccountabilityProfiles = accountabilityProfiles.filter(
      (accountabilityProfile) => accountabilityProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(accountabilityProfiles.map((accountabilityProfile) => accountabilityProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalAccountabilityProfiles: accountabilityProfiles.length,
      activeAccountabilityProfiles,
      categories,
    });
  }

  async serializeAccountabilityProfile(accountabilityProfile: AccountabilityProfile): Promise<string> {
    return this.accountabilityProfileSerializer.serialize(accountabilityProfile);
  }

  async deserializeAccountabilityProfile(serialized: string): Promise<AccountabilityProfile> {
    return this.accountabilityProfileSerializer.deserialize(serialized);
  }
}
