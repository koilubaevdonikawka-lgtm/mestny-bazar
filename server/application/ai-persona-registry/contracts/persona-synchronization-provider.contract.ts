import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

/** Future integration point for persona synchronization. Not wired yet. */
export interface IPersonaSynchronizationProvider {
  synchronize(personas: readonly Persona[]): Promise<void>;
}
