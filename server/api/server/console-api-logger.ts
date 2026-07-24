import type { ApiLogger } from "@server/api/server/api.types";

/** Default console-backed logger for the API layer. */
export class ConsoleApiLogger implements ApiLogger {
  info(message: string, context: Record<string, unknown> = {}): void {
    console.info(message, context);
  }

  warn(message: string, context: Record<string, unknown> = {}): void {
    console.warn(message, context);
  }

  error(message: string, context: Record<string, unknown> = {}): void {
    console.error(message, context);
  }
}
