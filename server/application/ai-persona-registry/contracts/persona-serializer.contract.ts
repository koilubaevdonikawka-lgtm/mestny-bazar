import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

export interface IPersonaSerializer {
  serialize(persona: Persona): Promise<string>;
  deserialize(serialized: string): Promise<Persona>;
}
