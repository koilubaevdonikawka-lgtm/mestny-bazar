import type { ILogger } from "@server/observability/logging";
import type { ILogFormatter } from "@server/observability/logging/i-log-formatter";
import type { ILogSink } from "@server/observability/logging/i-log-sink";

/** Provides scoped loggers and logging pipeline components. */
export interface ILoggerProvider {
  getLogger(scope: string): ILogger;
  getFormatter?(): ILogFormatter;
  getSink?(): ILogSink;
}
