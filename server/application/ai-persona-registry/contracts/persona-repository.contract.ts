import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

export interface IPersonaRepository {
  save(persona: Persona): Promise<void>;
  findById(personaId: string): Promise<Persona | null>;
  findByName(name: string): Promise<Persona | null>;
  findByType(type: string): Promise<readonly Persona[]>;
  findAll(): Promise<readonly Persona[]>;
  delete(personaId: string): Promise<boolean>;
}
