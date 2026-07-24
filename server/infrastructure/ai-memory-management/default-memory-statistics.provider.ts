import type { IMemoryStatisticsProvider } from "@server/application/ai-memory-management/contracts/memory-statistics-provider.contract";
import type { MemoryStatistics } from "@server/application/ai-memory-management/models/memory-record.model";

/** Default in-memory memory statistics provider. */
export class DefaultMemoryStatisticsProvider implements IMemoryStatisticsProvider {
  async getStatistics(input: {
    totalRecords: number;
    activeRecords: number;
    categories: readonly string[];
  }): Promise<MemoryStatistics> {
    return Object.freeze({
      totalRecords: input.totalRecords,
      activeRecords: input.activeRecords,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
