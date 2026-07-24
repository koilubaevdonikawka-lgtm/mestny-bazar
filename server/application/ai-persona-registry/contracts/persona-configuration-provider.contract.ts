import type { Persona } from "@server/application/ai-persona-registry/models/persona.model";

/** Future integration point for persona configuration management. Not wired yet. */
export interface IPersonaConfigurationProvider {
  resolveConfiguration(persona: Persona): Promise<string>;
  validateConfiguration(configuration: string): Promise<boolean>;
}
