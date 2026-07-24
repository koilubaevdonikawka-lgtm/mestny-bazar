import type { RelationRegistryStatistics } from "@server/application/ai-relation-registry/models/relation.model";

export interface IRelationStatisticsProvider {
  getStatistics(input: {
    totalRelations: number;
    activeRelations: number;
    categories: readonly string[];
  }): Promise<RelationRegistryStatistics>;
}
