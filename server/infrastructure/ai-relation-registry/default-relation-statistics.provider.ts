import type { IRelationStatisticsProvider } from "@server/application/ai-relation-registry/contracts/relation-statistics-provider.contract";
import type { RelationRegistryStatistics } from "@server/application/ai-relation-registry/models/relation.model";

/** Default in-memory relation statistics provider. */
export class DefaultRelationStatisticsProvider implements IRelationStatisticsProvider {
  async getStatistics(input: {
    totalRelations: number;
    activeRelations: number;
    categories: readonly string[];
  }): Promise<RelationRegistryStatistics> {
    return Object.freeze({
      totalRelations: input.totalRelations,
      activeRelations: input.activeRelations,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
