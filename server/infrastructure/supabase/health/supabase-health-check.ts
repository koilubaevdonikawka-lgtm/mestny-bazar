import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, SupabaseSnapshotTables } from "@server/infrastructure/supabase/shared";

export type SupabaseHealthStatus = "healthy" | "unhealthy";

export interface SupabaseHealthReport {
  readonly status: SupabaseHealthStatus;
  readonly timestamp: string;
  readonly message?: string;
  readonly latencyMs?: number;
}

/** Verifies Supabase connectivity for infrastructure readiness checks. */
export class SupabaseHealthCheck {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {
    Object.freeze(this);
  }

  async check(): Promise<SupabaseHealthReport> {
    const started = performance.now();

    try {
      const client = this.clientProvider.getServiceClient();
      const table =
        this.configuration.schema === "public"
          ? client.from(SupabaseSnapshotTables.products)
          : client.schema(this.configuration.schema).from(SupabaseSnapshotTables.products);

      assertSupabaseSuccess(
        "supabase.health.check",
        await table.select("id", { count: "exact", head: true }),
      );

      return Object.freeze({
        status: "healthy",
        timestamp: new Date().toISOString(),
        message: "Supabase connection is healthy",
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
