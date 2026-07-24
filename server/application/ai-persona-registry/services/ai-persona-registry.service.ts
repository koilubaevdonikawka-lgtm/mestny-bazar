/**
 * AI Persona Registry — unified registry for AI personas.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IPersonaCatalog } from "@server/application/ai-persona-registry/contracts/persona-catalog.contract";
import type { IPersonaRepository } from "@server/application/ai-persona-registry/contracts/persona-repository.contract";
import type { IPersonaSerializer } from "@server/application/ai-persona-registry/contracts/persona-serializer.contract";
import type { IPersonaStatisticsProvider } from "@server/application/ai-persona-registry/contracts/persona-statistics-provider.contract";
import type { IPersonaValidator } from "@server/application/ai-persona-registry/contracts/persona-validator.contract";
import {
  createPersona,
  type DeletePersonaResult,
  type FindPersonaByNameResult,
  type ListPersonasByTypeResult,
  type ListPersonasResult,
  type Persona,
  type PersonaRegistryStatistics,
  type RegisterPersonaInput,
  type UpdatePersonaInput,
} from "@server/application/ai-persona-registry/models/persona.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiPersonaRegistryService {
  constructor(
    private readonly personaRepository: IPersonaRepository,
    private readonly personaCatalog: IPersonaCatalog,
    private readonly personaValidator: IPersonaValidator,
    private readonly personaSerializer: IPersonaSerializer,
    private readonly statisticsProvider: IPersonaStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerPersona(input: RegisterPersonaInput): Promise<Persona> {
    const validation = await this.personaValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.personaRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Persona already exists with name: ${input.name.trim()}`);
    }

    const persona = createPersona({
      personaId: this.idGenerator.generate(),
      name: input.name,
      type: input.type,
      description: input.description,
      configuration: input.configuration,
      status: input.status,
    });

    await this.personaRepository.save(persona);
    await this.personaCatalog.register(persona);
    return persona;
  }

  async getPersona(personaId: string): Promise<Persona | null> {
    return this.personaRepository.findById(personaId.trim());
  }

  async listPersonas(): Promise<ListPersonasResult> {
    const personas = Object.freeze(
      [...(await this.personaRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ personas, total: personas.length });
  }

  async updatePersona(input: UpdatePersonaInput): Promise<Persona> {
    const personaId = input.personaId.trim();
    const existing = await this.personaRepository.findById(personaId);
    if (!existing) {
      throw new Error(`Persona not found: ${personaId}`);
    }

    const validation = await this.personaValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.personaRepository.findByName(input.name.trim());
      if (duplicate && duplicate.personaId !== existing.personaId) {
        throw new Error(`Persona already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createPersona({
      personaId: existing.personaId,
      name: input.name?.trim() ?? existing.name,
      type: input.type?.trim() ?? existing.type,
      description: input.description ?? existing.description,
      configuration: input.configuration ?? existing.configuration,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.personaRepository.save(updated);
    await this.personaCatalog.register(updated);
    return updated;
  }

  async deletePersona(personaId: string): Promise<DeletePersonaResult> {
    const normalizedPersonaId = personaId.trim();
    const deleted = await this.personaRepository.delete(normalizedPersonaId);
    if (deleted) {
      await this.personaCatalog.remove(normalizedPersonaId);
    }
    return Object.freeze({ personaId: normalizedPersonaId, deleted });
  }

  async findPersonaByName(name: string): Promise<FindPersonaByNameResult> {
    const normalizedName = name.trim();
    const persona = await this.personaRepository.findByName(normalizedName);
    return Object.freeze({ persona });
  }

  async listPersonasByType(type: string): Promise<ListPersonasByTypeResult> {
    const normalizedType = type.trim();
    const personas = Object.freeze(
      [...(await this.personaRepository.findByType(normalizedType))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      personas,
      total: personas.length,
      type: normalizedType,
    });
  }

  async getPersonaRegistryStatistics(): Promise<PersonaRegistryStatistics> {
    const personas = await this.personaRepository.findAll();
    const activePersonas = personas.filter((persona) => persona.status === "active").length;
    const types = Object.freeze([
      ...new Set(personas.map((persona) => persona.type)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalPersonas: personas.length,
      activePersonas,
      types,
    });
  }

  async serializePersona(persona: Persona): Promise<string> {
    return this.personaSerializer.serialize(persona);
  }

  async deserializePersona(serialized: string): Promise<Persona> {
    return this.personaSerializer.deserialize(serialized);
  }
}
