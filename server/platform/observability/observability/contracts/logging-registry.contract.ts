import type { LogEntry, LogSeverity } from "@server/platform/observability/observability/models";

export interface LogCategoryDescriptor {
  readonly category: string;
  readonly severity: LogSeverity;
  readonly structuredFields: readonly string[];
}

/** Contract for log category registration (no storage). */
export interface ILoggingRegistry {
  registerCategory(descriptor: LogCategoryDescriptor): void;
  registerEntry(entry: LogEntry): LogEntry;
  listCategories(): readonly LogCategoryDescriptor[];
  listEntries(category?: string): readonly LogEntry[];
}
