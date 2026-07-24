import type { IConceptStatisticsProvider } from "@server/application/ai-concept-registry/contracts/concept-statistics-provider.contract";
import type { ConceptRegistryStatistics } from "@server/application/ai-concept-registry/models/concept.model";

/** Default in-memory concept statistics provider. */
export class DefaultConceptStatisticsProvider implements IConceptStatisticsProvider {
  async getStatistics(input: {
    totalConcepts: number;
    activeConcepts: number;
    categories: readonly string[];
  }): Promise<ConceptRegistryStatistics> {
    return Object.freeze({
      totalConcepts: input.totalConcepts,
      activeConcepts: input.activeConcepts,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
