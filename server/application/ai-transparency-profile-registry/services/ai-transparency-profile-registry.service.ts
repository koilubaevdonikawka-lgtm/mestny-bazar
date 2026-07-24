/**
 * AI Transparency Profile Registry — unified registry for AI transparency profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ITransparencyProfileCatalog } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-catalog.contract";
import type { ITransparencyProfileRepository } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-repository.contract";
import type { ITransparencyProfileSerializer } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-serializer.contract";
import type { ITransparencyProfileStatisticsProvider } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-statistics-provider.contract";
import type { ITransparencyProfileValidator } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-validator.contract";
import {
  createTransparencyProfile,
  type DeleteTransparencyProfileResult,
  type FindTransparencyProfileByNameResult,
  type TransparencyProfile,
  type TransparencyProfileRegistryStatistics,
  type ListTransparencyProfilesByCategoryResult,
  type ListTransparencyProfilesResult,
  type RegisterTransparencyProfileInput,
  type UpdateTransparencyProfileInput,
} from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiTransparencyProfileRegistryService {
  constructor(
    private readonly transparencyProfileRepository: ITransparencyProfileRepository,
    private readonly transparencyProfileCatalog: ITransparencyProfileCatalog,
    private readonly transparencyProfileValidator: ITransparencyProfileValidator,
    private readonly transparencyProfileSerializer: ITransparencyProfileSerializer,
    private readonly statisticsProvider: ITransparencyProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerTransparencyProfile(input: RegisterTransparencyProfileInput): Promise<TransparencyProfile> {
    const validation = await this.transparencyProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.transparencyProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Transparency profile already exists with name: ${input.name.trim()}`);
    }

    const transparencyProfile = createTransparencyProfile({
      transparencyProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.transparencyProfileRepository.save(transparencyProfile);
    await this.transparencyProfileCatalog.register(transparencyProfile);
    return transparencyProfile;
  }

  async getTransparencyProfile(transparencyProfileId: string): Promise<TransparencyProfile | null> {
    return this.transparencyProfileRepository.findById(transparencyProfileId.trim());
  }

  async listTransparencyProfiles(): Promise<ListTransparencyProfilesResult> {
    const transparencyProfiles = Object.freeze(
      [...(await this.transparencyProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ transparencyProfiles, total: transparencyProfiles.length });
  }

  async updateTransparencyProfile(input: UpdateTransparencyProfileInput): Promise<TransparencyProfile> {
    const transparencyProfileId = input.transparencyProfileId.trim();
    const existing = await this.transparencyProfileRepository.findById(transparencyProfileId);
    if (!existing) {
      throw new Error(`Transparency profile not found: ${transparencyProfileId}`);
    }

    const validation = await this.transparencyProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.transparencyProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.transparencyProfileId !== existing.transparencyProfileId) {
        throw new Error(`Transparency profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createTransparencyProfile({
      transparencyProfileId: existing.transparencyProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.transparencyProfileRepository.save(updated);
    await this.transparencyProfileCatalog.register(updated);
    return updated;
  }

  async deleteTransparencyProfile(transparencyProfileId: string): Promise<DeleteTransparencyProfileResult> {
    const normalizedTransparencyProfileId = transparencyProfileId.trim();
    const deleted = await this.transparencyProfileRepository.delete(normalizedTransparencyProfileId);
    if (deleted) {
      await this.transparencyProfileCatalog.remove(normalizedTransparencyProfileId);
    }
    return Object.freeze({ transparencyProfileId: normalizedTransparencyProfileId, deleted });
  }

  async findTransparencyProfileByName(name: string): Promise<FindTransparencyProfileByNameResult> {
    const normalizedName = name.trim();
    const transparencyProfile = await this.transparencyProfileRepository.findByName(normalizedName);
    return Object.freeze({ transparencyProfile });
  }

  async listTransparencyProfilesByCategory(category: string): Promise<ListTransparencyProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const transparencyProfiles = Object.freeze(
      [...(await this.transparencyProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      transparencyProfiles,
      total: transparencyProfiles.length,
      category: normalizedCategory,
    });
  }

  async getTransparencyProfileRegistryStatistics(): Promise<TransparencyProfileRegistryStatistics> {
    const transparencyProfiles = await this.transparencyProfileRepository.findAll();
    const activeTransparencyProfiles = transparencyProfiles.filter(
      (transparencyProfile) => transparencyProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(transparencyProfiles.map((transparencyProfile) => transparencyProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalTransparencyProfiles: transparencyProfiles.length,
      activeTransparencyProfiles,
      categories,
    });
  }

  async serializeTransparencyProfile(transparencyProfile: TransparencyProfile): Promise<string> {
    return this.transparencyProfileSerializer.serialize(transparencyProfile);
  }

  async deserializeTransparencyProfile(serialized: string): Promise<TransparencyProfile> {
    return this.transparencyProfileSerializer.deserialize(serialized);
  }
}
