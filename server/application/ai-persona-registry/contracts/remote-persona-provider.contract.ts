import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

/** Future integration point for external persona providers. Not wired yet. */
export interface IRemotePersonaProvider {
  fetchRemote(personaId: string): Promise<Persona | null>;
  pushRemote(persona: Persona): Promise<void>;
}
