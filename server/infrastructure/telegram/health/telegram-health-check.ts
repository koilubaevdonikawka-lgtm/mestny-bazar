import type { ITelegramClientProvider } from "@server/infrastructure/telegram/client";

export type TelegramHealthStatus = "healthy" | "unhealthy";

export interface TelegramHealthReport {
  readonly status: TelegramHealthStatus;
  readonly timestamp: string;
  readonly message?: string;
  readonly latencyMs?: number;
  readonly botUsername?: string;
}

/** Verifies Telegram Bot API connectivity for infrastructure readiness checks. */
export class TelegramHealthCheck {
  constructor(private readonly client: ITelegramClientProvider) {
    Object.freeze(this);
  }

  async check(): Promise<TelegramHealthReport> {
    const started = performance.now();

    try {
      const response = await this.client.request<{ username?: string }>({
        method: "GET",
        methodName: "getMe",
      });

      return Object.freeze({
        status: "healthy",
        timestamp: new Date().toISOString(),
        message: "Telegram Bot API is reachable",
        latencyMs: performance.now() - started,
        botUsername: response.data.result?.username,
      });
    } catch (error) {
      return Object.freeze({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : String(error),
        latencyMs: performance.now() - started,
      });
    }
  }
}
