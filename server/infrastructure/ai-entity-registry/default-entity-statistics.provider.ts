import type { IEntityStatisticsProvider } from "@server/application/ai-entity-registry/contracts/entity-statistics-provider.contract";
import type { EntityRegistryStatistics } from "@server/application/ai-entity-registry/models/entity.model";

/** Default in-memory entity statistics provider. */
export class DefaultEntityStatisticsProvider implements IEntityStatisticsProvider {
  async getStatistics(input: {
    totalEntities: number;
    activeEntities: number;
    categories: readonly string[];
  }): Promise<EntityRegistryStatistics> {
    return Object.freeze({
      totalEntities: input.totalEntities,
      activeEntities: input.activeEntities,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
