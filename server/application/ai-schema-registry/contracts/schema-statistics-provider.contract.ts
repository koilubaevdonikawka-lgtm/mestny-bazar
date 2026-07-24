import type { SchemaRegistryStatistics } from "@server/application/ai-schema-registry/models/schema.model";

export interface ISchemaStatisticsProvider {
  getStatistics(input: {
    totalSchemas: number;
    activeSchemas: number;
    categories: readonly string[];
  }): Promise<SchemaRegistryStatistics>;
}
