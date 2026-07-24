import type { LogEntry } from "@server/observability/logging/log-entry";

/** Formats structured log entries for downstream sinks. */
export interface ILogFormatter {
  format(entry: LogEntry): string;
}
