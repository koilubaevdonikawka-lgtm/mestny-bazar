export type LogLevel = "debug" | "info" | "warn" | "error";

/** System log entry — logging only, no domain data. */
export interface LogEntry {
  readonly logId: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly source: string;
  readonly context: Readonly<Record<string, string>>;
  readonly formattedMessage: string;
  readonly createdAt: string;
}

export interface WriteLogInput {
  readonly level: LogLevel;
  readonly message: string;
  readonly source?: string;
  readonly context?: Readonly<Record<string, string>>;
}

export interface SearchLogsInput {
  readonly query: string;
}

export interface FilterLogsInput {
  readonly level?: LogLevel;
  readonly source?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface ListLogsResult {
  readonly entries: readonly LogEntry[];
  readonly total: number;
}

export interface ClearLogsResult {
  readonly removedCount: number;
}

export interface ExportLogsResult {
  readonly format: string;
  readonly payload: string;
  readonly count: number;
}

export function createLogEntry(input: {
  logId: string;
  level: LogLevel;
  message: string;
  source?: string;
  context?: Readonly<Record<string, string>>;
  formattedMessage: string;
  createdAt?: string;
}): LogEntry {
  return Object.freeze({
    logId: input.logId.trim(),
    level: input.level,
    message: input.message,
    source: (input.source ?? "system").trim(),
    context: Object.freeze({ ...(input.context ?? {}) }),
    formattedMessage: input.formattedMessage,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function isLogLevel(value: string): value is LogLevel {
  return value === "debug" || value === "info" || value === "warn" || value === "error";
}
