import type { OntologyRegistryStatistics } from "@server/application/ai-ontology-registry/models/ontology.model";

export interface IOntologyStatisticsProvider {
  getStatistics(input: {
    totalOntologies: number;
    activeOntologies: number;
    categories: readonly string[];
  }): Promise<OntologyRegistryStatistics>;
}
