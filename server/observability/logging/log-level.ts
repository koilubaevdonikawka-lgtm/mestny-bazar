/** Supported log severity levels for structured logging. */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/** Canonical ordering for log level comparison. */
export const LogLevelPriority: Readonly<Record<LogLevel, number>> = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
});

/** Returns true when `level` meets or exceeds `minimum`. */
export function isLogLevelEnabled(level: LogLevel, minimum: LogLevel): boolean {
  return LogLevelPriority[level] >= LogLevelPriority[minimum];
}

/** Normalizes arbitrary input into a supported log level. */
export function parseLogLevel(raw: string): LogLevel {
  const normalized = raw?.trim().toLowerCase();
  if (normalized && normalized in LogLevelPriority) {
    return normalized as LogLevel;
  }
  return "info";
}
