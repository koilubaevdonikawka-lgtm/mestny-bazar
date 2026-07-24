import type { ILogger, LogEntry } from "@server/infrastructure/logging/logger.port";

/** Adds structured base context to delegated logger output. */
export class StructuredLogger implements ILogger {
  constructor(
    private readonly inner: ILogger,
    private readonly baseContext: Readonly<Record<string, unknown>>,
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.inner.debug(message, this.mergeContext(context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.inner.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.inner.warn(message, this.mergeContext(context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.inner.error(message, this.mergeContext(context));
  }

  withContext(context: Record<string, unknown>): StructuredLogger {
    return new StructuredLogger(this.inner, {
      ...this.baseContext,
      ...context,
    });
  }

  toEntry(level: LogEntry["level"], message: string, context?: Record<string, unknown>): LogEntry {
    return Object.freeze({
      level,
      message,
      timestamp: new Date().toISOString(),
      context: Object.freeze(this.mergeContext(context)),
    });
  }

  private mergeContext(context?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...this.baseContext,
      ...(context ?? {}),
    };
  }
}
