import type { MemoryStatistics } from "@server/application/ai-memory-management/models/memory-record.model";

export interface IMemoryStatisticsProvider {
  getStatistics(input: {
    totalRecords: number;
    activeRecords: number;
    categories: readonly string[];
  }): Promise<MemoryStatistics>;
}
