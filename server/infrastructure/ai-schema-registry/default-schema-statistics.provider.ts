import type { ISchemaStatisticsProvider } from "@server/application/ai-schema-registry/contracts/schema-statistics-provider.contract";
import type { SchemaRegistryStatistics } from "@server/application/ai-schema-registry/models/schema.model";

/** Default in-memory schema statistics provider. */
export class DefaultSchemaStatisticsProvider implements ISchemaStatisticsProvider {
  async getStatistics(input: {
    totalSchemas: number;
    activeSchemas: number;
    categories: readonly string[];
  }): Promise<SchemaRegistryStatistics> {
    return Object.freeze({
      totalSchemas: input.totalSchemas,
      activeSchemas: input.activeSchemas,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
