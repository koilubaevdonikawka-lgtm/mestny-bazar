import type { IStorageClientProvider } from "@server/infrastructure/storage/client";

export type StorageHealthStatus = "healthy" | "unhealthy";

export interface StorageHealthReport {
  readonly status: StorageHealthStatus;
  readonly timestamp: string;
  readonly message?: string;
  readonly latencyMs?: number;
}

/** Verifies storage backend connectivity for infrastructure readiness checks. */
export class StorageHealthCheck {
  constructor(private readonly client: IStorageClientProvider) {
    Object.freeze(this);
  }

  async check(): Promise<StorageHealthReport> {
    const started = performance.now();

    try {
      const probe = await this.client.probeHealth();
      return Object.freeze({
        status: probe.reachable ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        message: probe.message,
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
