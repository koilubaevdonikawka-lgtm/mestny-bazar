import type { ILogFormatter } from "@server/application/logging-management/contracts/log-formatter.contract";
import type { WriteLogInput } from "@server/application/logging-management/models/log-entry.model";

/** JSON log formatter — produces structured log line. */
export class JsonLogFormatter implements ILogFormatter {
  format(input: WriteLogInput): string {
    return JSON.stringify({
      level: input.level,
      message: input.message,
      source: (input.source ?? "system").trim(),
      context: input.context ?? {},
      timestamp: new Date().toISOString(),
    });
  }
}
