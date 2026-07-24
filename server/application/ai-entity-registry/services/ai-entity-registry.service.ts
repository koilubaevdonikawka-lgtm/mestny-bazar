/**
 * AI Entity Registry — unified registry for AI entities.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IEntityCatalog } from "@server/application/ai-entity-registry/contracts/entity-catalog.contract";
import type { IEntityRepository } from "@server/application/ai-entity-registry/contracts/entity-repository.contract";
import type { IEntitySerializer } from "@server/application/ai-entity-registry/contracts/entity-serializer.contract";
import type { IEntityStatisticsProvider } from "@server/application/ai-entity-registry/contracts/entity-statistics-provider.contract";
import type { IEntityValidator } from "@server/application/ai-entity-registry/contracts/entity-validator.contract";
import {
  createEntity,
  type DeleteEntityResult,
  type FindEntityByNameResult,
  type ListEntitiesByCategoryResult,
  type ListEntitiesResult,
  type RegisterEntityInput,
  type Entity,
  type EntityRegistryStatistics,
  type UpdateEntityInput,
} from "@server/application/ai-entity-registry/models/entity.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiEntityRegistryService {
  constructor(
    private readonly entityRepository: IEntityRepository,
    private readonly entityCatalog: IEntityCatalog,
    private readonly entityValidator: IEntityValidator,
    private readonly entitySerializer: IEntitySerializer,
    private readonly statisticsProvider: IEntityStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerEntity(input: RegisterEntityInput): Promise<Entity> {
    const validation = await this.entityValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.entityRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Entity already exists with name: ${input.name.trim()}`);
    }

    const entity = createEntity({
      entityId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.entityRepository.save(entity);
    await this.entityCatalog.register(entity);
    return entity;
  }

  async getEntity(entityId: string): Promise<Entity | null> {
    return this.entityRepository.findById(entityId.trim());
  }

  async listEntities(): Promise<ListEntitiesResult> {
    const entities = Object.freeze(
      [...(await this.entityRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ entities, total: entities.length });
  }

  async updateEntity(input: UpdateEntityInput): Promise<Entity> {
    const entityId = input.entityId.trim();
    const existing = await this.entityRepository.findById(entityId);
    if (!existing) {
      throw new Error(`Entity not found: ${entityId}`);
    }

    const validation = await this.entityValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.entityRepository.findByName(input.name.trim());
      if (duplicate && duplicate.entityId !== existing.entityId) {
        throw new Error(`Entity already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createEntity({
      entityId: existing.entityId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.entityRepository.save(updated);
    await this.entityCatalog.register(updated);
    return updated;
  }

  async deleteEntity(entityId: string): Promise<DeleteEntityResult> {
    const normalizedEntityId = entityId.trim();
    const deleted = await this.entityRepository.delete(normalizedEntityId);
    if (deleted) {
      await this.entityCatalog.remove(normalizedEntityId);
    }
    return Object.freeze({ entityId: normalizedEntityId, deleted });
  }

  async findEntityByName(name: string): Promise<FindEntityByNameResult> {
    const normalizedName = name.trim();
    const entity = await this.entityRepository.findByName(normalizedName);
    return Object.freeze({ entity });
  }

  async listEntitiesByCategory(category: string): Promise<ListEntitiesByCategoryResult> {
    const normalizedCategory = category.trim();
    const entities = Object.freeze(
      [...(await this.entityRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      entities,
      total: entities.length,
      category: normalizedCategory,
    });
  }

  async getEntityRegistryStatistics(): Promise<EntityRegistryStatistics> {
    const entities = await this.entityRepository.findAll();
    const activeEntities = entities.filter((entity) => entity.status === "active").length;
    const categories = Object.freeze([
      ...new Set(entities.map((entity) => entity.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalEntities: entities.length,
      activeEntities,
      categories,
    });
  }

  async serializeEntity(entity: Entity): Promise<string> {
    return this.entitySerializer.serialize(entity);
  }

  async deserializeEntity(serialized: string): Promise<Entity> {
    return this.entitySerializer.deserialize(serialized);
  }
}
