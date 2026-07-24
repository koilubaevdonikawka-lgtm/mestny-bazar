import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

/** Future integration point for persona import. Not wired yet. */
export interface IPersonaImportProvider {
  importFrom(source: string): Promise<readonly Persona[]>;
}
