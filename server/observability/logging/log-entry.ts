import type { LogLevel } from "@server/observability/logging/log-level";

/** Structured log record — transport and sink agnostic. */
export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly scope?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly identityType?: string;
  readonly identityKey?: string;
  readonly fields?: Readonly<Record<string, unknown>>;
}

export interface CreateLogEntryInput {
  level: LogLevel;
  message: string;
  timestamp?: string;
  scope?: string;
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  identityType?: string;
  identityKey?: string;
  fields?: Readonly<Record<string, unknown>>;
}

/** Creates an immutable structured log entry. */
export function createLogEntry(input: CreateLogEntryInput): LogEntry {
  const message = input.message?.trim();
  if (!message) {
    throw new Error("LogEntry requires a non-empty message.");
  }

  return Object.freeze({
    level: input.level,
    message,
    timestamp: input.timestamp ?? new Date().toISOString(),
    scope: input.scope?.trim() || undefined,
    requestId: input.requestId?.trim() || undefined,
    correlationId: input.correlationId?.trim() || undefined,
    traceId: input.traceId?.trim() || undefined,
    spanId: input.spanId?.trim() || undefined,
    identityType: input.identityType?.trim() || undefined,
    identityKey: input.identityKey?.trim() || undefined,
    fields: input.fields ? Object.freeze({ ...input.fields }) : undefined,
  });
}
