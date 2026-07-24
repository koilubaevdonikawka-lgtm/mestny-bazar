import type { EntityRegistryStatistics } from "@server/application/ai-entity-registry/models/entity.model";

export interface IEntityStatisticsProvider {
  getStatistics(input: {
    totalEntities: number;
    activeEntities: number;
    categories: readonly string[];
  }): Promise<EntityRegistryStatistics>;
}
