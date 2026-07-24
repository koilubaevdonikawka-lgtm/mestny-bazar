import type { ILogFilter } from "@server/application/logging-management/contracts/log-filter.contract";
import type {
  FilterLogsInput,
  LogEntry,
} from "@server/application/logging-management/models/log-entry.model";

/** Default in-memory log filter and search. */
export class DefaultLogFilter implements ILogFilter {
  filter(entries: readonly LogEntry[], criteria: FilterLogsInput): readonly LogEntry[] {
    return Object.freeze(
      entries.filter((entry) => {
        if (criteria.level && entry.level !== criteria.level) {
          return false;
        }

        if (criteria.source && entry.source !== criteria.source.trim()) {
          return false;
        }

        if (criteria.from && entry.createdAt < criteria.from) {
          return false;
        }

        if (criteria.to && entry.createdAt > criteria.to) {
          return false;
        }

        return true;
      }),
    );
  }

  search(entries: readonly LogEntry[], query: string): readonly LogEntry[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return Object.freeze([]);
    }

    return Object.freeze(
      entries.filter((entry) => {
        const haystack = [
          entry.message,
          entry.source,
          entry.level,
          entry.formattedMessage,
          JSON.stringify(entry.context),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      }),
    );
  }
}
