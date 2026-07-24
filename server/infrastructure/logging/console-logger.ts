import type { ILogger, LogEntry, LogLevel } from "@server/infrastructure/logging/logger.port";

/** Console-based logger without external dependencies. */
export class ConsoleLogger implements ILogger {
  constructor(private readonly scope: string = "app") {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.write("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.write("error", message, context);
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? Object.freeze({ ...context }) : undefined,
    };

    const line = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.scope}] ${entry.message}`;
    if (level === "error") {
      console.error(line, entry.context ?? "");
      return;
    }
    if (level === "warn") {
      console.warn(line, entry.context ?? "");
      return;
    }
    if (level === "debug") {
      console.debug(line, entry.context ?? "");
      return;
    }
    console.info(line, entry.context ?? "");
  }
}
