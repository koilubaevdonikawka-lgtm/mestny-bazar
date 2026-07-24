export type LogSeverity = "debug" | "info" | "warn" | "error" | "fatal";

/** Structured log entry metadata (no storage persistence). */
export interface LogEntry {
  readonly id: string;
  readonly category: string;
  readonly severity: LogSeverity;
  readonly message: string;
  readonly fields: Readonly<Record<string, unknown>>;
  readonly loggedAt: string;
}

export function createLogEntry(input: {
  id?: string;
  category: string;
  severity: LogSeverity;
  message: string;
  fields?: Readonly<Record<string, unknown>>;
}): LogEntry {
  return Object.freeze({
    id: input.id ?? `log-${Date.now()}`,
    category: input.category.trim(),
    severity: input.severity,
    message: input.message.trim(),
    fields: Object.freeze({ ...(input.fields ?? {}) }),
    loggedAt: new Date().toISOString(),
  });
}
