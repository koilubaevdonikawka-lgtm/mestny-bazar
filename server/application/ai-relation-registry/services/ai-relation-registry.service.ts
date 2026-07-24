/**
 * AI Relation Registry — unified registry for AI relations.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IRelationCatalog } from "@server/application/ai-relation-registry/contracts/relation-catalog.contract";
import type { IRelationRepository } from "@server/application/ai-relation-registry/contracts/relation-repository.contract";
import type { IRelationSerializer } from "@server/application/ai-relation-registry/contracts/relation-serializer.contract";
import type { IRelationStatisticsProvider } from "@server/application/ai-relation-registry/contracts/relation-statistics-provider.contract";
import type { IRelationValidator } from "@server/application/ai-relation-registry/contracts/relation-validator.contract";
import {
  createRelation,
  type DeleteRelationResult,
  type FindRelationByNameResult,
  type ListRelationsByCategoryResult,
  type ListRelationsResult,
  type RegisterRelationInput,
  type Relation,
  type RelationRegistryStatistics,
  type UpdateRelationInput,
} from "@server/application/ai-relation-registry/models/relation.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiRelationRegistryService {
  constructor(
    private readonly relationRepository: IRelationRepository,
    private readonly relationCatalog: IRelationCatalog,
    private readonly relationValidator: IRelationValidator,
    private readonly relationSerializer: IRelationSerializer,
    private readonly statisticsProvider: IRelationStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerRelation(input: RegisterRelationInput): Promise<Relation> {
    const validation = await this.relationValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.relationRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Relation already exists with name: ${input.name.trim()}`);
    }

    const relation = createRelation({
      relationId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.relationRepository.save(relation);
    await this.relationCatalog.register(relation);
    return relation;
  }

  async getRelation(relationId: string): Promise<Relation | null> {
    return this.relationRepository.findById(relationId.trim());
  }

  async listRelations(): Promise<ListRelationsResult> {
    const relations = Object.freeze(
      [...(await this.relationRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ relations, total: relations.length });
  }

  async updateRelation(input: UpdateRelationInput): Promise<Relation> {
    const relationId = input.relationId.trim();
    const existing = await this.relationRepository.findById(relationId);
    if (!existing) {
      throw new Error(`Relation not found: ${relationId}`);
    }

    const validation = await this.relationValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.relationRepository.findByName(input.name.trim());
      if (duplicate && duplicate.relationId !== existing.relationId) {
        throw new Error(`Relation already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createRelation({
      relationId: existing.relationId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.relationRepository.save(updated);
    await this.relationCatalog.register(updated);
    return updated;
  }

  async deleteRelation(relationId: string): Promise<DeleteRelationResult> {
    const normalizedRelationId = relationId.trim();
    const deleted = await this.relationRepository.delete(normalizedRelationId);
    if (deleted) {
      await this.relationCatalog.remove(normalizedRelationId);
    }
    return Object.freeze({ relationId: normalizedRelationId, deleted });
  }

  async findRelationByName(name: string): Promise<FindRelationByNameResult> {
    const normalizedName = name.trim();
    const relation = await this.relationRepository.findByName(normalizedName);
    return Object.freeze({ relation });
  }

  async listRelationsByCategory(category: string): Promise<ListRelationsByCategoryResult> {
    const normalizedCategory = category.trim();
    const relations = Object.freeze(
      [...(await this.relationRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      relations,
      total: relations.length,
      category: normalizedCategory,
    });
  }

  async getRelationRegistryStatistics(): Promise<RelationRegistryStatistics> {
    const relations = await this.relationRepository.findAll();
    const activeRelations = relations.filter((relation) => relation.status === "active").length;
    const categories = Object.freeze([
      ...new Set(relations.map((relation) => relation.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalRelations: relations.length,
      activeRelations,
      categories,
    });
  }

  async serializeRelation(relation: Relation): Promise<string> {
    return this.relationSerializer.serialize(relation);
  }

  async deserializeRelation(serialized: string): Promise<Relation> {
    return this.relationSerializer.deserialize(serialized);
  }
}
