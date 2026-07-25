import { getRequestId } from "./request-context";

export type LogLevel = "info" | "warn" | "error";

export interface LogMeta {
  error?: unknown;
  [key: string]: unknown;
}

interface SerializedError {
  message: string;
  stack?: string;
}

function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) return { message: error.message, stack: error.stack };
  return { message: String(error) };
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const { error, ...rest } = meta ?? {};
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    requestId: getRequestId(),
    ...rest,
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/**
 * Single logging surface for server-side code, replacing scattered
 * console.error calls with no shared shape. Every entry is structured JSON
 * (parseable by wrangler tail / any log sink) and automatically carries the
 * current request's correlation id (see request-context.ts) — a failed
 * checkout can be traced across the checkout -> inventory -> order ->
 * event-bus chain by grepping one id.
 *
 * reportException is a deliberate seam for a future error-tracking service:
 * wiring in Sentry (or similar) later means changing the body of that one
 * function, not any of the call sites across the domain layer. No external
 * service is configured today — this only writes structured JSON to the
 * console.
 */
export const logger = {
  info(message: string, meta?: LogMeta): void {
    write("info", message, meta);
  },
  warn(message: string, meta?: LogMeta): void {
    write("warn", message, meta);
  },
  error(message: string, meta?: LogMeta): void {
    write("error", message, meta);
    reportException(message, meta);
  },
};

function reportException(_message: string, _meta?: LogMeta): void {
  // No external error-tracking service is configured. When one is added:
  //   const error = meta?.error instanceof Error ? meta.error : new Error(message);
  //   Sentry.captureException(error, { extra: meta, tags: { requestId: getRequestId() } });
}
