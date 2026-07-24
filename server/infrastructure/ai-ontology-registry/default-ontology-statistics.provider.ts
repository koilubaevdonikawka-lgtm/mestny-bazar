import type { IOntologyStatisticsProvider } from "@server/application/ai-ontology-registry/contracts/ontology-statistics-provider.contract";
import type { OntologyRegistryStatistics } from "@server/application/ai-ontology-registry/models/ontology.model";

/** Default in-memory ontology statistics provider. */
export class DefaultOntologyStatisticsProvider implements IOntologyStatisticsProvider {
  async getStatistics(input: {
    totalOntologies: number;
    activeOntologies: number;
    categories: readonly string[];
  }): Promise<OntologyRegistryStatistics> {
    return Object.freeze({
      totalOntologies: input.totalOntologies,
      activeOntologies: input.activeOntologies,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
