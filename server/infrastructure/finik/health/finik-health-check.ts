import type { IFinikClientProvider } from "@server/infrastructure/finik/client";

export type FinikHealthStatus = "healthy" | "unhealthy";

export interface FinikHealthReport {
  readonly status: FinikHealthStatus;
  readonly timestamp: string;
  readonly message?: string;
  readonly latencyMs?: number;
}

/** Verifies Finik API connectivity for infrastructure readiness checks. */
export class FinikHealthCheck {
  constructor(private readonly client: IFinikClientProvider) {
    Object.freeze(this);
  }

  async check(): Promise<FinikHealthReport> {
    const started = performance.now();

    try {
      await this.client.request<{ status?: string }>({
        method: "GET",
        path: "/v1/health",
      });

      return Object.freeze({
        status: "healthy",
        timestamp: new Date().toISOString(),
        message: "Finik API is reachable",
        latencyMs: performance.now() - started,
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
