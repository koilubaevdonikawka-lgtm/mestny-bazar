import type { ILoggingRegistry, LogCategoryDescriptor } from "@server/platform/observability/observability/contracts";
import { createLogEntry, type LogEntry } from "@server/platform/observability/observability/models";
import { createLogRegisteredEvent } from "@server/platform/observability/observability/events";

/** Registers log categories and structured log metadata (no storage). */
export class LoggingRegistry implements ILoggingRegistry {
  private readonly categories = new Map<string, LogCategoryDescriptor>();
  private readonly entries: LogEntry[] = [];

  registerCategory(descriptor: LogCategoryDescriptor): void {
    this.categories.set(descriptor.category, Object.freeze({
      ...descriptor,
      structuredFields: Object.freeze([...descriptor.structuredFields]),
    }));
  }

  registerEntry(entry: LogEntry): LogEntry {
    this.entries.push(Object.freeze({ ...entry }));
    createLogRegisteredEvent(entry);
    return entry;
  }

  listCategories(): readonly LogCategoryDescriptor[] {
    return Object.freeze([...this.categories.values()]);
  }

  listEntries(category?: string): readonly LogEntry[] {
    const filtered = category
      ? this.entries.filter((entry) => entry.category === category)
      : this.entries;
    return Object.freeze([...filtered]);
  }
}

export function createLogCategory(
  category: string,
  severity: LogCategoryDescriptor["severity"],
  structuredFields: readonly string[] = [],
): LogCategoryDescriptor {
  return Object.freeze({
    category,
    severity,
    structuredFields: Object.freeze([...structuredFields]),
  });
}
