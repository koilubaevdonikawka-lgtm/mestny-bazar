/**
 * AI Service Profile Registry — unified registry for AI service profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IServiceProfileCatalog } from "@server/application/ai-service-profile-registry/contracts/service-profile-catalog.contract";
import type { IServiceProfileRepository } from "@server/application/ai-service-profile-registry/contracts/service-profile-repository.contract";
import type { IServiceProfileSerializer } from "@server/application/ai-service-profile-registry/contracts/service-profile-serializer.contract";
import type { IServiceProfileStatisticsProvider } from "@server/application/ai-service-profile-registry/contracts/service-profile-statistics-provider.contract";
import type { IServiceProfileValidator } from "@server/application/ai-service-profile-registry/contracts/service-profile-validator.contract";
import {
  createServiceProfile,
  type DeleteServiceProfileResult,
  type FindServiceProfileByNameResult,
  type ServiceProfile,
  type ServiceProfileRegistryStatistics,
  type ListServiceProfilesByCategoryResult,
  type ListServiceProfilesResult,
  type RegisterServiceProfileInput,
  type UpdateServiceProfileInput,
} from "@server/application/ai-service-profile-registry/models/service-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiServiceProfileRegistryService {
  constructor(
    private readonly serviceProfileRepository: IServiceProfileRepository,
    private readonly serviceProfileCatalog: IServiceProfileCatalog,
    private readonly serviceProfileValidator: IServiceProfileValidator,
    private readonly serviceProfileSerializer: IServiceProfileSerializer,
    private readonly statisticsProvider: IServiceProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerServiceProfile(input: RegisterServiceProfileInput): Promise<ServiceProfile> {
    const validation = await this.serviceProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.serviceProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Service profile already exists with name: ${input.name.trim()}`);
    }

    const serviceProfile = createServiceProfile({
      serviceProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.serviceProfileRepository.save(serviceProfile);
    await this.serviceProfileCatalog.register(serviceProfile);
    return serviceProfile;
  }

  async getServiceProfile(serviceProfileId: string): Promise<ServiceProfile | null> {
    return this.serviceProfileRepository.findById(serviceProfileId.trim());
  }

  async listServiceProfiles(): Promise<ListServiceProfilesResult> {
    const serviceProfiles = Object.freeze(
      [...(await this.serviceProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ serviceProfiles, total: serviceProfiles.length });
  }

  async updateServiceProfile(input: UpdateServiceProfileInput): Promise<ServiceProfile> {
    const serviceProfileId = input.serviceProfileId.trim();
    const existing = await this.serviceProfileRepository.findById(serviceProfileId);
    if (!existing) {
      throw new Error(`Service profile not found: ${serviceProfileId}`);
    }

    const validation = await this.serviceProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.serviceProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.serviceProfileId !== existing.serviceProfileId) {
        throw new Error(`Service profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createServiceProfile({
      serviceProfileId: existing.serviceProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.serviceProfileRepository.save(updated);
    await this.serviceProfileCatalog.register(updated);
    return updated;
  }

  async deleteServiceProfile(serviceProfileId: string): Promise<DeleteServiceProfileResult> {
    const normalizedServiceProfileId = serviceProfileId.trim();
    const deleted = await this.serviceProfileRepository.delete(normalizedServiceProfileId);
    if (deleted) {
      await this.serviceProfileCatalog.remove(normalizedServiceProfileId);
    }
    return Object.freeze({ serviceProfileId: normalizedServiceProfileId, deleted });
  }

  async findServiceProfileByName(name: string): Promise<FindServiceProfileByNameResult> {
    const normalizedName = name.trim();
    const serviceProfile = await this.serviceProfileRepository.findByName(normalizedName);
    return Object.freeze({ serviceProfile });
  }

  async listServiceProfilesByCategory(category: string): Promise<ListServiceProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const serviceProfiles = Object.freeze(
      [...(await this.serviceProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      serviceProfiles,
      total: serviceProfiles.length,
      category: normalizedCategory,
    });
  }

  async getServiceProfileRegistryStatistics(): Promise<ServiceProfileRegistryStatistics> {
    const serviceProfiles = await this.serviceProfileRepository.findAll();
    const activeServiceProfiles = serviceProfiles.filter(
      (serviceProfile) => serviceProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(serviceProfiles.map((serviceProfile) => serviceProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalServiceProfiles: serviceProfiles.length,
      activeServiceProfiles,
      categories,
    });
  }

  async serializeServiceProfile(serviceProfile: ServiceProfile): Promise<string> {
    return this.serviceProfileSerializer.serialize(serviceProfile);
  }

  async deserializeServiceProfile(serialized: string): Promise<ServiceProfile> {
    return this.serviceProfileSerializer.deserialize(serialized);
  }
}
