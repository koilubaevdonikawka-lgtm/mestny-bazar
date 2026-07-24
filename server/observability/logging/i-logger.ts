import type { LogEntry } from "@server/observability/logging/log-entry";

/** Formats structured log entries for downstream sinks. */
export interface ILogFormatter {
  format(entry: LogEntry): string;
}

/** Receives formatted or structured log entries for persistence/output. */
export interface ILogSink {
  write(entry: LogEntry, formatted?: string): void | Promise<void>;
  flush?(): void | Promise<void>;
}

/** Structured logging port — implementations live in infrastructure. */
export interface ILogger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
  fatal(message: string, fields?: Record<string, unknown>): void;

  withContext(context: Readonly<Record<string, unknown>>): ILogger;
  child(scope: string): ILogger;
}
