/**
 * AI Security Profile Registry — unified registry for AI security profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISecurityProfileCatalog } from "@server/application/ai-security-profile-registry/contracts/security-profile-catalog.contract";
import type { ISecurityProfileRepository } from "@server/application/ai-security-profile-registry/contracts/security-profile-repository.contract";
import type { ISecurityProfileSerializer } from "@server/application/ai-security-profile-registry/contracts/security-profile-serializer.contract";
import type { ISecurityProfileStatisticsProvider } from "@server/application/ai-security-profile-registry/contracts/security-profile-statistics-provider.contract";
import type { ISecurityProfileValidator } from "@server/application/ai-security-profile-registry/contracts/security-profile-validator.contract";
import {
  createSecurityProfile,
  type DeleteSecurityProfileResult,
  type FindSecurityProfileByNameResult,
  type SecurityProfile,
  type SecurityProfileRegistryStatistics,
  type ListSecurityProfilesByCategoryResult,
  type ListSecurityProfilesResult,
  type RegisterSecurityProfileInput,
  type UpdateSecurityProfileInput,
} from "@server/application/ai-security-profile-registry/models/security-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiSecurityProfileRegistryService {
  constructor(
    private readonly securityProfileRepository: ISecurityProfileRepository,
    private readonly securityProfileCatalog: ISecurityProfileCatalog,
    private readonly securityProfileValidator: ISecurityProfileValidator,
    private readonly securityProfileSerializer: ISecurityProfileSerializer,
    private readonly statisticsProvider: ISecurityProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSecurityProfile(input: RegisterSecurityProfileInput): Promise<SecurityProfile> {
    const validation = await this.securityProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.securityProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Security profile already exists with name: ${input.name.trim()}`);
    }

    const securityProfile = createSecurityProfile({
      securityProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.securityProfileRepository.save(securityProfile);
    await this.securityProfileCatalog.register(securityProfile);
    return securityProfile;
  }

  async getSecurityProfile(securityProfileId: string): Promise<SecurityProfile | null> {
    return this.securityProfileRepository.findById(securityProfileId.trim());
  }

  async listSecurityProfiles(): Promise<ListSecurityProfilesResult> {
    const securityProfiles = Object.freeze(
      [...(await this.securityProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ securityProfiles, total: securityProfiles.length });
  }

  async updateSecurityProfile(input: UpdateSecurityProfileInput): Promise<SecurityProfile> {
    const securityProfileId = input.securityProfileId.trim();
    const existing = await this.securityProfileRepository.findById(securityProfileId);
    if (!existing) {
      throw new Error(`Security profile not found: ${securityProfileId}`);
    }

    const validation = await this.securityProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.securityProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.securityProfileId !== existing.securityProfileId) {
        throw new Error(`Security profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createSecurityProfile({
      securityProfileId: existing.securityProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.securityProfileRepository.save(updated);
    await this.securityProfileCatalog.register(updated);
    return updated;
  }

  async deleteSecurityProfile(securityProfileId: string): Promise<DeleteSecurityProfileResult> {
    const normalizedSecurityProfileId = securityProfileId.trim();
    const deleted = await this.securityProfileRepository.delete(normalizedSecurityProfileId);
    if (deleted) {
      await this.securityProfileCatalog.remove(normalizedSecurityProfileId);
    }
    return Object.freeze({ securityProfileId: normalizedSecurityProfileId, deleted });
  }

  async findSecurityProfileByName(name: string): Promise<FindSecurityProfileByNameResult> {
    const normalizedName = name.trim();
    const securityProfile = await this.securityProfileRepository.findByName(normalizedName);
    return Object.freeze({ securityProfile });
  }

  async listSecurityProfilesByCategory(category: string): Promise<ListSecurityProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const securityProfiles = Object.freeze(
      [...(await this.securityProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      securityProfiles,
      total: securityProfiles.length,
      category: normalizedCategory,
    });
  }

  async getSecurityProfileRegistryStatistics(): Promise<SecurityProfileRegistryStatistics> {
    const securityProfiles = await this.securityProfileRepository.findAll();
    const activeSecurityProfiles = securityProfiles.filter(
      (securityProfile) => securityProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(securityProfiles.map((securityProfile) => securityProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalSecurityProfiles: securityProfiles.length,
      activeSecurityProfiles,
      categories,
    });
  }

  async serializeSecurityProfile(securityProfile: SecurityProfile): Promise<string> {
    return this.securityProfileSerializer.serialize(securityProfile);
  }

  async deserializeSecurityProfile(serialized: string): Promise<SecurityProfile> {
    return this.securityProfileSerializer.deserialize(serialized);
  }
}
