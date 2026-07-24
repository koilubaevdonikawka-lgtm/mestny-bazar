import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

export interface IPersonaCatalog {
  register(persona: Persona): Promise<void>;
  remove(personaId: string): Promise<void>;
  findById(personaId: string): Promise<Persona | null>;
  findByName(name: string): Promise<Persona | null>;
  findByType(type: string): Promise<readonly Persona[]>;
  listAll(): Promise<readonly Persona[]>;
}
