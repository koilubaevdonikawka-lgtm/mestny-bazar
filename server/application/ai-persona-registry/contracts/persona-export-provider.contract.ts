import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

/** Future integration point for persona export. Not wired yet. */
export interface IPersonaExportProvider {
  exportTo(personas: readonly Persona[]): Promise<string>;
}
