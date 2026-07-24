/**
 * AI Resource Registry — unified registry for AI resources.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IResourceCatalog } from "@server/application/ai-resource-registry/contracts/resource-catalog.contract";
import type { IResourceRepository } from "@server/application/ai-resource-registry/contracts/resource-repository.contract";
import type { IResourceSerializer } from "@server/application/ai-resource-registry/contracts/resource-serializer.contract";
import type { IResourceStatisticsProvider } from "@server/application/ai-resource-registry/contracts/resource-statistics-provider.contract";
import type { IResourceValidator } from "@server/application/ai-resource-registry/contracts/resource-validator.contract";
import {
  createResource,
  type DeleteResourceResult,
  type FindResourceByNameResult,
  type ListResourcesByTypeResult,
  type ListResourcesResult,
  type RegisterResourceInput,
  type Resource,
  type ResourceRegistryStatistics,
  type UpdateResourceInput,
} from "@server/application/ai-resource-registry/models/resource.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiResourceRegistryService {
  constructor(
    private readonly resourceRepository: IResourceRepository,
    private readonly resourceCatalog: IResourceCatalog,
    private readonly resourceValidator: IResourceValidator,
    private readonly resourceSerializer: IResourceSerializer,
    private readonly statisticsProvider: IResourceStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerResource(input: RegisterResourceInput): Promise<Resource> {
    const validation = await this.resourceValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.resourceRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Resource already exists with name: ${input.name.trim()}`);
    }

    const resource = createResource({
      resourceId: this.idGenerator.generate(),
      name: input.name,
      type: input.type,
      description: input.description,
      status: input.status,
    });

    await this.resourceRepository.save(resource);
    await this.resourceCatalog.register(resource);
    return resource;
  }

  async getResource(resourceId: string): Promise<Resource | null> {
    return this.resourceRepository.findById(resourceId.trim());
  }

  async listResources(): Promise<ListResourcesResult> {
    const resources = Object.freeze(
      [...(await this.resourceRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ resources, total: resources.length });
  }

  async updateResource(input: UpdateResourceInput): Promise<Resource> {
    const resourceId = input.resourceId.trim();
    const existing = await this.resourceRepository.findById(resourceId);
    if (!existing) {
      throw new Error(`Resource not found: ${resourceId}`);
    }

    const validation = await this.resourceValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.resourceRepository.findByName(input.name.trim());
      if (duplicate && duplicate.resourceId !== existing.resourceId) {
        throw new Error(`Resource already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createResource({
      resourceId: existing.resourceId,
      name: input.name?.trim() ?? existing.name,
      type: input.type?.trim() ?? existing.type,
      description: input.description ?? existing.description,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.resourceRepository.save(updated);
    await this.resourceCatalog.register(updated);
    return updated;
  }

  async deleteResource(resourceId: string): Promise<DeleteResourceResult> {
    const normalizedResourceId = resourceId.trim();
    const deleted = await this.resourceRepository.delete(normalizedResourceId);
    if (deleted) {
      await this.resourceCatalog.remove(normalizedResourceId);
    }
    return Object.freeze({ resourceId: normalizedResourceId, deleted });
  }

  async findResourceByName(name: string): Promise<FindResourceByNameResult> {
    const normalizedName = name.trim();
    const resource = await this.resourceRepository.findByName(normalizedName);
    return Object.freeze({ resource });
  }

  async listResourcesByType(type: string): Promise<ListResourcesByTypeResult> {
    const normalizedType = type.trim();
    const resources = Object.freeze(
      [...(await this.resourceRepository.findByType(normalizedType))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      resources,
      total: resources.length,
      type: normalizedType,
    });
  }

  async getResourceRegistryStatistics(): Promise<ResourceRegistryStatistics> {
    const resources = await this.resourceRepository.findAll();
    const activeResources = resources.filter((resource) => resource.status === "active").length;
    const types = Object.freeze([
      ...new Set(resources.map((resource) => resource.type)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalResources: resources.length,
      activeResources,
      types,
    });
  }

  async serializeResource(resource: Resource): Promise<string> {
    return this.resourceSerializer.serialize(resource);
  }

  async deserializeResource(serialized: string): Promise<Resource> {
    return this.resourceSerializer.deserialize(serialized);
  }
}
