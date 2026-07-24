/**
 * AI Ontology Registry — unified registry for AI ontologies.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IOntologyCatalog } from "@server/application/ai-ontology-registry/contracts/ontology-catalog.contract";
import type { IOntologyRepository } from "@server/application/ai-ontology-registry/contracts/ontology-repository.contract";
import type { IOntologySerializer } from "@server/application/ai-ontology-registry/contracts/ontology-serializer.contract";
import type { IOntologyStatisticsProvider } from "@server/application/ai-ontology-registry/contracts/ontology-statistics-provider.contract";
import type { IOntologyValidator } from "@server/application/ai-ontology-registry/contracts/ontology-validator.contract";
import {
  createOntology,
  type DeleteOntologyResult,
  type FindOntologyByNameResult,
  type ListOntologiesByCategoryResult,
  type ListOntologiesResult,
  type RegisterOntologyInput,
  type Ontology,
  type OntologyRegistryStatistics,
  type UpdateOntologyInput,
} from "@server/application/ai-ontology-registry/models/ontology.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiOntologyRegistryService {
  constructor(
    private readonly ontologyRepository: IOntologyRepository,
    private readonly ontologyCatalog: IOntologyCatalog,
    private readonly ontologyValidator: IOntologyValidator,
    private readonly ontologySerializer: IOntologySerializer,
    private readonly statisticsProvider: IOntologyStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerOntology(input: RegisterOntologyInput): Promise<Ontology> {
    const validation = await this.ontologyValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.ontologyRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Ontology already exists with name: ${input.name.trim()}`);
    }

    const ontology = createOntology({
      ontologyId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.ontologyRepository.save(ontology);
    await this.ontologyCatalog.register(ontology);
    return ontology;
  }

  async getOntology(ontologyId: string): Promise<Ontology | null> {
    return this.ontologyRepository.findById(ontologyId.trim());
  }

  async listOntologies(): Promise<ListOntologiesResult> {
    const ontologies = Object.freeze(
      [...(await this.ontologyRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ ontologies, total: ontologies.length });
  }

  async updateOntology(input: UpdateOntologyInput): Promise<Ontology> {
    const ontologyId = input.ontologyId.trim();
    const existing = await this.ontologyRepository.findById(ontologyId);
    if (!existing) {
      throw new Error(`Ontology not found: ${ontologyId}`);
    }

    const validation = await this.ontologyValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.ontologyRepository.findByName(input.name.trim());
      if (duplicate && duplicate.ontologyId !== existing.ontologyId) {
        throw new Error(`Ontology already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createOntology({
      ontologyId: existing.ontologyId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.ontologyRepository.save(updated);
    await this.ontologyCatalog.register(updated);
    return updated;
  }

  async deleteOntology(ontologyId: string): Promise<DeleteOntologyResult> {
    const normalizedOntologyId = ontologyId.trim();
    const deleted = await this.ontologyRepository.delete(normalizedOntologyId);
    if (deleted) {
      await this.ontologyCatalog.remove(normalizedOntologyId);
    }
    return Object.freeze({ ontologyId: normalizedOntologyId, deleted });
  }

  async findOntologyByName(name: string): Promise<FindOntologyByNameResult> {
    const normalizedName = name.trim();
    const ontology = await this.ontologyRepository.findByName(normalizedName);
    return Object.freeze({ ontology });
  }

  async listOntologiesByCategory(category: string): Promise<ListOntologiesByCategoryResult> {
    const normalizedCategory = category.trim();
    const ontologies = Object.freeze(
      [...(await this.ontologyRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      ontologies,
      total: ontologies.length,
      category: normalizedCategory,
    });
  }

  async getOntologyRegistryStatistics(): Promise<OntologyRegistryStatistics> {
    const ontologies = await this.ontologyRepository.findAll();
    const activeOntologies = ontologies.filter((ontology) => ontology.status === "active").length;
    const categories = Object.freeze([
      ...new Set(ontologies.map((ontology) => ontology.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalOntologies: ontologies.length,
      activeOntologies,
      categories,
    });
  }

  async serializeOntology(ontology: Ontology): Promise<string> {
    return this.ontologySerializer.serialize(ontology);
  }

  async deserializeOntology(serialized: string): Promise<Ontology> {
    return this.ontologySerializer.deserialize(serialized);
  }
}
