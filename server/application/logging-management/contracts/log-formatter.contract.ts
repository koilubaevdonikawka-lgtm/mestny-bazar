import type { WriteLogInput } from "@server/application/logging-management/models/log-entry.model";

export interface ILogFormatter {
  format(input: WriteLogInput): string;
}
