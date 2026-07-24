import type { IPersonaSerializer } from "@server/application/ai-persona-registry/contracts/persona-serializer.contract";
import {
  createPersona,
  type Persona,
} from "@server/application/ai-persona-registry/models/persona.model";

/** JSON-based persona serializer. */
export class JsonPersonaSerializer implements IPersonaSerializer {
  async serialize(persona: Persona): Promise<string> {
    return JSON.stringify(persona);
  }

  async deserialize(serialized: string): Promise<Persona> {
    if (!serialized.trim()) {
      throw new Error("Serialized persona cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Persona>;
    return createPersona({
      personaId: parsed.personaId ?? "",
      name: parsed.name ?? "",
      type: parsed.type ?? "",
      description: parsed.description,
      configuration: parsed.configuration,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
