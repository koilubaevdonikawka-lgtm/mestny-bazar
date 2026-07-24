/**
 * AI Concept Registry — unified registry for AI concepts.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IConceptCatalog } from "@server/application/ai-concept-registry/contracts/concept-catalog.contract";
import type { IConceptRepository } from "@server/application/ai-concept-registry/contracts/concept-repository.contract";
import type { IConceptSerializer } from "@server/application/ai-concept-registry/contracts/concept-serializer.contract";
import type { IConceptStatisticsProvider } from "@server/application/ai-concept-registry/contracts/concept-statistics-provider.contract";
import type { IConceptValidator } from "@server/application/ai-concept-registry/contracts/concept-validator.contract";
import {
  createConcept,
  type DeleteConceptResult,
  type FindConceptByNameResult,
  type ListConceptsByCategoryResult,
  type ListConceptsResult,
  type RegisterConceptInput,
  type Concept,
  type ConceptRegistryStatistics,
  type UpdateConceptInput,
} from "@server/application/ai-concept-registry/models/concept.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiConceptRegistryService {
  constructor(
    private readonly conceptRepository: IConceptRepository,
    private readonly conceptCatalog: IConceptCatalog,
    private readonly conceptValidator: IConceptValidator,
    private readonly conceptSerializer: IConceptSerializer,
    private readonly statisticsProvider: IConceptStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerConcept(input: RegisterConceptInput): Promise<Concept> {
    const validation = await this.conceptValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.conceptRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Concept already exists with name: ${input.name.trim()}`);
    }

    const concept = createConcept({
      conceptId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.conceptRepository.save(concept);
    await this.conceptCatalog.register(concept);
    return concept;
  }

  async getConcept(conceptId: string): Promise<Concept | null> {
    return this.conceptRepository.findById(conceptId.trim());
  }

  async listConcepts(): Promise<ListConceptsResult> {
    const concepts = Object.freeze(
      [...(await this.conceptRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ concepts, total: concepts.length });
  }

  async updateConcept(input: UpdateConceptInput): Promise<Concept> {
    const conceptId = input.conceptId.trim();
    const existing = await this.conceptRepository.findById(conceptId);
    if (!existing) {
      throw new Error(`Concept not found: ${conceptId}`);
    }

    const validation = await this.conceptValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.conceptRepository.findByName(input.name.trim());
      if (duplicate && duplicate.conceptId !== existing.conceptId) {
        throw new Error(`Concept already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createConcept({
      conceptId: existing.conceptId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.conceptRepository.save(updated);
    await this.conceptCatalog.register(updated);
    return updated;
  }

  async deleteConcept(conceptId: string): Promise<DeleteConceptResult> {
    const normalizedConceptId = conceptId.trim();
    const deleted = await this.conceptRepository.delete(normalizedConceptId);
    if (deleted) {
      await this.conceptCatalog.remove(normalizedConceptId);
    }
    return Object.freeze({ conceptId: normalizedConceptId, deleted });
  }

  async findConceptByName(name: string): Promise<FindConceptByNameResult> {
    const normalizedName = name.trim();
    const concept = await this.conceptRepository.findByName(normalizedName);
    return Object.freeze({ concept });
  }

  async listConceptsByCategory(category: string): Promise<ListConceptsByCategoryResult> {
    const normalizedCategory = category.trim();
    const concepts = Object.freeze(
      [...(await this.conceptRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      concepts,
      total: concepts.length,
      category: normalizedCategory,
    });
  }

  async getConceptRegistryStatistics(): Promise<ConceptRegistryStatistics> {
    const concepts = await this.conceptRepository.findAll();
    const activeConcepts = concepts.filter((concept) => concept.status === "active").length;
    const categories = Object.freeze([
      ...new Set(concepts.map((concept) => concept.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalConcepts: concepts.length,
      activeConcepts,
      categories,
    });
  }

  async serializeConcept(concept: Concept): Promise<string> {
    return this.conceptSerializer.serialize(concept);
  }

  async deserializeConcept(serialized: string): Promise<Concept> {
    return this.conceptSerializer.deserialize(serialized);
  }
}
