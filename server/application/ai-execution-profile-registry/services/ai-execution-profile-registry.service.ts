/**
 * AI Execution Profile Registry — unified registry for AI execution profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IExecutionProfileCatalog } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-catalog.contract";
import type { IExecutionProfileRepository } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-repository.contract";
import type { IExecutionProfileSerializer } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-serializer.contract";
import type { IExecutionProfileStatisticsProvider } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-statistics-provider.contract";
import type { IExecutionProfileValidator } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-validator.contract";
import {
  createExecutionProfile,
  type DeleteExecutionProfileResult,
  type FindExecutionProfileByNameResult,
  type ListExecutionProfilesByCategoryResult,
  type ListExecutionProfilesResult,
  type RegisterExecutionProfileInput,
  type ExecutionProfile,
  type ExecutionProfileRegistryStatistics,
  type UpdateExecutionProfileInput,
} from "@server/application/ai-execution-profile-registry/models/execution-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiExecutionProfileRegistryService {
  constructor(
    private readonly executionProfileRepository: IExecutionProfileRepository,
    private readonly executionProfileCatalog: IExecutionProfileCatalog,
    private readonly executionProfileValidator: IExecutionProfileValidator,
    private readonly executionProfileSerializer: IExecutionProfileSerializer,
    private readonly statisticsProvider: IExecutionProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerExecutionProfile(input: RegisterExecutionProfileInput): Promise<ExecutionProfile> {
    const validation = await this.executionProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.executionProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Execution profile already exists with name: ${input.name.trim()}`);
    }

    const executionProfile = createExecutionProfile({
      executionProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.executionProfileRepository.save(executionProfile);
    await this.executionProfileCatalog.register(executionProfile);
    return executionProfile;
  }

  async getExecutionProfile(executionProfileId: string): Promise<ExecutionProfile | null> {
    return this.executionProfileRepository.findById(executionProfileId.trim());
  }

  async listExecutionProfiles(): Promise<ListExecutionProfilesResult> {
    const executionProfiles = Object.freeze(
      [...(await this.executionProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ executionProfiles, total: executionProfiles.length });
  }

  async updateExecutionProfile(input: UpdateExecutionProfileInput): Promise<ExecutionProfile> {
    const executionProfileId = input.executionProfileId.trim();
    const existing = await this.executionProfileRepository.findById(executionProfileId);
    if (!existing) {
      throw new Error(`Execution profile not found: ${executionProfileId}`);
    }

    const validation = await this.executionProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.executionProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.executionProfileId !== existing.executionProfileId) {
        throw new Error(`Execution profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createExecutionProfile({
      executionProfileId: existing.executionProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.executionProfileRepository.save(updated);
    await this.executionProfileCatalog.register(updated);
    return updated;
  }

  async deleteExecutionProfile(executionProfileId: string): Promise<DeleteExecutionProfileResult> {
    const normalizedExecutionProfileId = executionProfileId.trim();
    const deleted = await this.executionProfileRepository.delete(normalizedExecutionProfileId);
    if (deleted) {
      await this.executionProfileCatalog.remove(normalizedExecutionProfileId);
    }
    return Object.freeze({ executionProfileId: normalizedExecutionProfileId, deleted });
  }

  async findExecutionProfileByName(name: string): Promise<FindExecutionProfileByNameResult> {
    const normalizedName = name.trim();
    const executionProfile = await this.executionProfileRepository.findByName(normalizedName);
    return Object.freeze({ executionProfile });
  }

  async listExecutionProfilesByCategory(category: string): Promise<ListExecutionProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const executionProfiles = Object.freeze(
      [...(await this.executionProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      executionProfiles,
      total: executionProfiles.length,
      category: normalizedCategory,
    });
  }

  async getExecutionProfileRegistryStatistics(): Promise<ExecutionProfileRegistryStatistics> {
    const executionProfiles = await this.executionProfileRepository.findAll();
    const activeExecutionProfiles = executionProfiles.filter(
      (executionProfile) => executionProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(executionProfiles.map((executionProfile) => executionProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalExecutionProfiles: executionProfiles.length,
      activeExecutionProfiles,
      categories,
    });
  }

  async serializeExecutionProfile(executionProfile: ExecutionProfile): Promise<string> {
    return this.executionProfileSerializer.serialize(executionProfile);
  }

  async deserializeExecutionProfile(serialized: string): Promise<ExecutionProfile> {
    return this.executionProfileSerializer.deserialize(serialized);
  }
}
