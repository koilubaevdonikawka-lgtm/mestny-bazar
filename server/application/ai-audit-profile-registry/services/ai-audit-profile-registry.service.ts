/**
 * AI Audit Profile Registry — unified registry for AI audit profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IAuditProfileCatalog } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-catalog.contract";
import type { IAuditProfileRepository } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-repository.contract";
import type { IAuditProfileSerializer } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-serializer.contract";
import type { IAuditProfileStatisticsProvider } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-statistics-provider.contract";
import type { IAuditProfileValidator } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-validator.contract";
import {
  createAuditProfile,
  type DeleteAuditProfileResult,
  type FindAuditProfileByNameResult,
  type AuditProfile,
  type AuditProfileRegistryStatistics,
  type ListAuditProfilesByCategoryResult,
  type ListAuditProfilesResult,
  type RegisterAuditProfileInput,
  type UpdateAuditProfileInput,
} from "@server/application/ai-audit-profile-registry/models/audit-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiAuditProfileRegistryService {
  constructor(
    private readonly auditProfileRepository: IAuditProfileRepository,
    private readonly auditProfileCatalog: IAuditProfileCatalog,
    private readonly auditProfileValidator: IAuditProfileValidator,
    private readonly auditProfileSerializer: IAuditProfileSerializer,
    private readonly statisticsProvider: IAuditProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerAuditProfile(input: RegisterAuditProfileInput): Promise<AuditProfile> {
    const validation = await this.auditProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.auditProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Audit profile already exists with name: ${input.name.trim()}`);
    }

    const auditProfile = createAuditProfile({
      auditProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.auditProfileRepository.save(auditProfile);
    await this.auditProfileCatalog.register(auditProfile);
    return auditProfile;
  }

  async getAuditProfile(auditProfileId: string): Promise<AuditProfile | null> {
    return this.auditProfileRepository.findById(auditProfileId.trim());
  }

  async listAuditProfiles(): Promise<ListAuditProfilesResult> {
    const auditProfiles = Object.freeze(
      [...(await this.auditProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ auditProfiles, total: auditProfiles.length });
  }

  async updateAuditProfile(input: UpdateAuditProfileInput): Promise<AuditProfile> {
    const auditProfileId = input.auditProfileId.trim();
    const existing = await this.auditProfileRepository.findById(auditProfileId);
    if (!existing) {
      throw new Error(`Audit profile not found: ${auditProfileId}`);
    }

    const validation = await this.auditProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.auditProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.auditProfileId !== existing.auditProfileId) {
        throw new Error(`Audit profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createAuditProfile({
      auditProfileId: existing.auditProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.auditProfileRepository.save(updated);
    await this.auditProfileCatalog.register(updated);
    return updated;
  }

  async deleteAuditProfile(auditProfileId: string): Promise<DeleteAuditProfileResult> {
    const normalizedAuditProfileId = auditProfileId.trim();
    const deleted = await this.auditProfileRepository.delete(normalizedAuditProfileId);
    if (deleted) {
      await this.auditProfileCatalog.remove(normalizedAuditProfileId);
    }
    return Object.freeze({ auditProfileId: normalizedAuditProfileId, deleted });
  }

  async findAuditProfileByName(name: string): Promise<FindAuditProfileByNameResult> {
    const normalizedName = name.trim();
    const auditProfile = await this.auditProfileRepository.findByName(normalizedName);
    return Object.freeze({ auditProfile });
  }

  async listAuditProfilesByCategory(category: string): Promise<ListAuditProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const auditProfiles = Object.freeze(
      [...(await this.auditProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      auditProfiles,
      total: auditProfiles.length,
      category: normalizedCategory,
    });
  }

  async getAuditProfileRegistryStatistics(): Promise<AuditProfileRegistryStatistics> {
    const auditProfiles = await this.auditProfileRepository.findAll();
    const activeAuditProfiles = auditProfiles.filter(
      (auditProfile) => auditProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(auditProfiles.map((auditProfile) => auditProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalAuditProfiles: auditProfiles.length,
      activeAuditProfiles,
      categories,
    });
  }

  async serializeAuditProfile(auditProfile: AuditProfile): Promise<string> {
    return this.auditProfileSerializer.serialize(auditProfile);
  }

  async deserializeAuditProfile(serialized: string): Promise<AuditProfile> {
    return this.auditProfileSerializer.deserialize(serialized);
  }
}
