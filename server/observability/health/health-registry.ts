import {
  createHealthReport,
  toComponentReport,
  type HealthReport,
} from "@server/observability/health/health-report";
import type { HealthCheck } from "@server/observability/health/health-check";
import { mergeHealthStatuses } from "@server/observability/health/health-status";

/** Registry and executor for health checks. */
export class HealthRegistry {
  private readonly checks = new Map<string, HealthCheck>();

  register(check: HealthCheck): HealthRegistry {
    if (this.checks.has(check.name)) {
      throw new Error(`Health check already registered: ${check.name}`);
    }
    this.checks.set(check.name, check);
    return this;
  }

  unregister(name: string): HealthRegistry {
    this.checks.delete(name);
    return this;
  }

  list(): readonly HealthCheck[] {
    return Object.freeze([...this.checks.values()]);
  }

  async run(): Promise<HealthReport> {
    const components: Record<string, ReturnType<typeof toComponentReport>> = {};
    const statuses = await Promise.all(
      [...this.checks.entries()].map(async ([name, check]) => {
        const started = performance.now();
        const result = await check.check();
        const durationMs = performance.now() - started;
        const report = toComponentReport({ ...result, durationMs });
        components[name] = report;
        return report.status;
      }),
    );

    return createHealthReport({
      status: mergeHealthStatuses(statuses),
      timestamp: new Date().toISOString(),
      components: Object.freeze(components),
    });
  }
}
