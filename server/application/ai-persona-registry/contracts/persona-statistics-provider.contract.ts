import type { PersonaRegistryStatistics } from "@server/application/ai-persona-registry/models/persona.model";

export interface IPersonaStatisticsProvider {
  getStatistics(input: {
    totalPersonas: number;
    activePersonas: number;
    types: readonly string[];
  }): Promise<PersonaRegistryStatistics>;
}
