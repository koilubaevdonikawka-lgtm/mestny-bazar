import type { TaxonomyRegistryStatistics } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

export interface ITaxonomyStatisticsProvider {
  getStatistics(input: {
    totalTaxonomies: number;
    activeTaxonomies: number;
    categories: readonly string[];
  }): Promise<TaxonomyRegistryStatistics>;
}
