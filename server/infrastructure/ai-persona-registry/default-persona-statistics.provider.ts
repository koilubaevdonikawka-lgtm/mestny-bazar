import type { IPersonaStatisticsProvider } from "@server/application/ai-persona-registry/contracts/persona-statistics-provider.contract";
import type { PersonaRegistryStatistics } from "@server/application/ai-persona-registry/models/persona.model";

/** Default in-memory persona statistics provider. */
export class DefaultPersonaStatisticsProvider implements IPersonaStatisticsProvider {
  async getStatistics(input: {
    totalPersonas: number;
    activePersonas: number;
    types: readonly string[];
  }): Promise<PersonaRegistryStatistics> {
    return Object.freeze({
      totalPersonas: input.totalPersonas,
      activePersonas: input.activePersonas,
      typeCount: input.types.length,
      types: Object.freeze([...input.types]),
    });
  }
}
