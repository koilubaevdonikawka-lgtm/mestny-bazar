import type { ConceptRegistryStatistics } from "@server/application/ai-concept-registry/models/concept.model";

export interface IConceptStatisticsProvider {
  getStatistics(input: {
    totalConcepts: number;
    activeConcepts: number;
    categories: readonly string[];
  }): Promise<ConceptRegistryStatistics>;
}
