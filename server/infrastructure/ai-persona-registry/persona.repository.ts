import type { IPersonaRepository } from "@server/application/ai-persona-registry/contracts/persona-repository.contract";
import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

/** In-memory persona store. */
export class PersonaRepository implements IPersonaRepository {
  private readonly personas = new Map<string, Persona>();
  private readonly personasByName = new Map<string, string>();
  private readonly personasByType = new Map<string, Set<string>>();

  async save(persona: Persona): Promise<void> {
    const existing = this.personas.get(persona.personaId);
    if (existing) {
      if (existing.name !== persona.name) {
        this.personasByName.delete(existing.name);
      }
      if (existing.type !== persona.type) {
        this.removeFromType(existing.type, existing.personaId);
      }
    }

    this.personas.set(persona.personaId, persona);
    this.personasByName.set(persona.name, persona.personaId);
    this.addToType(persona.type, persona.personaId);
  }

  async findById(personaId: string): Promise<Persona | null> {
    return this.personas.get(personaId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Persona | null> {
    const personaId = this.personasByName.get(name.trim());
    if (!personaId) {
      return null;
    }
    return this.personas.get(personaId) ?? null;
  }

  async findByType(type: string): Promise<readonly Persona[]> {
    const personaIds = this.personasByType.get(type.trim());
    if (!personaIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...personaIds]
        .map((personaId) => this.personas.get(personaId))
        .filter((persona): persona is Persona => persona !== undefined),
    );
  }

  async findAll(): Promise<readonly Persona[]> {
    return Object.freeze([...this.personas.values()]);
  }

  async delete(personaId: string): Promise<boolean> {
    const persona = await this.findById(personaId);
    if (!persona) {
      return false;
    }
    this.personas.delete(persona.personaId);
    this.personasByName.delete(persona.name);
    this.removeFromType(persona.type, persona.personaId);
    return true;
  }

  private addToType(type: string, personaId: string): void {
    const normalizedType = type.trim();
    const typeSet = this.personasByType.get(normalizedType) ?? new Set<string>();
    typeSet.add(personaId);
    this.personasByType.set(normalizedType, typeSet);
  }

  private removeFromType(type: string, personaId: string): void {
    const normalizedType = type.trim();
    const typeSet = this.personasByType.get(normalizedType);
    if (!typeSet) {
      return;
    }
    typeSet.delete(personaId);
    if (typeSet.size === 0) {
      this.personasByType.delete(normalizedType);
    }
  }
}
