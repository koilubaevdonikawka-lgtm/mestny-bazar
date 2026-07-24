import type { ITaxonomyStatisticsProvider } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-statistics-provider.contract";
import type { TaxonomyRegistryStatistics } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

/** Default in-memory taxonomy statistics provider. */
export class DefaultTaxonomyStatisticsProvider implements ITaxonomyStatisticsProvider {
  async getStatistics(input: {
    totalTaxonomies: number;
    activeTaxonomies: number;
    categories: readonly string[];
  }): Promise<TaxonomyRegistryStatistics> {
    return Object.freeze({
      totalTaxonomies: input.totalTaxonomies,
      activeTaxonomies: input.activeTaxonomies,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
