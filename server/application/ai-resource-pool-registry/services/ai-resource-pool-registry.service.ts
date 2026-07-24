/**
 * AI Resource Pool Registry — unified registry for AI resource pools.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IResourcePoolCatalog } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-catalog.contract";
import type { IResourcePoolRepository } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-repository.contract";
import type { IResourcePoolSerializer } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-serializer.contract";
import type { IResourcePoolStatisticsProvider } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-statistics-provider.contract";
import type { IResourcePoolValidator } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-validator.contract";
import {
  createResourcePool,
  type DeleteResourcePoolResult,
  type FindResourcePoolByNameResult,
  type ListResourcePoolsByCategoryResult,
  type ListResourcePoolsResult,
  type RegisterResourcePoolInput,
  type ResourcePool,
  type ResourcePoolRegistryStatistics,
  type UpdateResourcePoolInput,
} from "@server/application/ai-resource-pool-registry/models/resource-pool.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiResourcePoolRegistryService {
  constructor(
    private readonly resourcePoolRepository: IResourcePoolRepository,
    private readonly resourcePoolCatalog: IResourcePoolCatalog,
    private readonly resourcePoolValidator: IResourcePoolValidator,
    private readonly resourcePoolSerializer: IResourcePoolSerializer,
    private readonly statisticsProvider: IResourcePoolStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerResourcePool(input: RegisterResourcePoolInput): Promise<ResourcePool> {
    const validation = await this.resourcePoolValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.resourcePoolRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Resource pool already exists with name: ${input.name.trim()}`);
    }

    const resourcePool = createResourcePool({
      resourcePoolId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.resourcePoolRepository.save(resourcePool);
    await this.resourcePoolCatalog.register(resourcePool);
    return resourcePool;
  }

  async getResourcePool(resourcePoolId: string): Promise<ResourcePool | null> {
    return this.resourcePoolRepository.findById(resourcePoolId.trim());
  }

  async listResourcePools(): Promise<ListResourcePoolsResult> {
    const resourcePools = Object.freeze(
      [...(await this.resourcePoolRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ resourcePools, total: resourcePools.length });
  }

  async updateResourcePool(input: UpdateResourcePoolInput): Promise<ResourcePool> {
    const resourcePoolId = input.resourcePoolId.trim();
    const existing = await this.resourcePoolRepository.findById(resourcePoolId);
    if (!existing) {
      throw new Error(`Resource pool not found: ${resourcePoolId}`);
    }

    const validation = await this.resourcePoolValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.resourcePoolRepository.findByName(input.name.trim());
      if (duplicate && duplicate.resourcePoolId !== existing.resourcePoolId) {
        throw new Error(`Resource pool already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createResourcePool({
      resourcePoolId: existing.resourcePoolId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.resourcePoolRepository.save(updated);
    await this.resourcePoolCatalog.register(updated);
    return updated;
  }

  async deleteResourcePool(resourcePoolId: string): Promise<DeleteResourcePoolResult> {
    const normalizedResourcePoolId = resourcePoolId.trim();
    const deleted = await this.resourcePoolRepository.delete(normalizedResourcePoolId);
    if (deleted) {
      await this.resourcePoolCatalog.remove(normalizedResourcePoolId);
    }
    return Object.freeze({ resourcePoolId: normalizedResourcePoolId, deleted });
  }

  async findResourcePoolByName(name: string): Promise<FindResourcePoolByNameResult> {
    const normalizedName = name.trim();
    const resourcePool = await this.resourcePoolRepository.findByName(normalizedName);
    return Object.freeze({ resourcePool });
  }

  async listResourcePoolsByCategory(category: string): Promise<ListResourcePoolsByCategoryResult> {
    const normalizedCategory = category.trim();
    const resourcePools = Object.freeze(
      [...(await this.resourcePoolRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      resourcePools,
      total: resourcePools.length,
      category: normalizedCategory,
    });
  }

  async getResourcePoolRegistryStatistics(): Promise<ResourcePoolRegistryStatistics> {
    const resourcePools = await this.resourcePoolRepository.findAll();
    const activeResourcePools = resourcePools.filter(
      (resourcePool) => resourcePool.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(resourcePools.map((resourcePool) => resourcePool.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalResourcePools: resourcePools.length,
      activeResourcePools,
      categories,
    });
  }

  async serializeResourcePool(resourcePool: ResourcePool): Promise<string> {
    return this.resourcePoolSerializer.serialize(resourcePool);
  }

  async deserializeResourcePool(serialized: string): Promise<ResourcePool> {
    return this.resourcePoolSerializer.deserialize(serialized);
  }
}
