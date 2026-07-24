import type { IMonitoringMetricsProvider } from "@server/application/ai-agent-monitoring/contracts/monitoring-metrics-provider.contract";
import type { MonitoringMetrics } from "@server/application/ai-agent-monitoring/models/monitoring.model";

/** Default in-memory monitoring metrics provider. */
export class DefaultMonitoringMetricsProvider implements IMonitoringMetricsProvider {
  async getMetrics(input: {
    totalEvents: number;
    totalStatuses: number;
    totalActivities: number;
    eventsBySeverity: Readonly<Record<"info" | "warning" | "error", number>>;
    statusesByState: Readonly<Record<"online" | "offline" | "idle" | "busy" | "error", number>>;
  }): Promise<MonitoringMetrics> {
    return Object.freeze({
      totalEvents: input.totalEvents,
      totalStatuses: input.totalStatuses,
      totalActivities: input.totalActivities,
      eventsBySeverity: Object.freeze({ ...input.eventsBySeverity }),
      statusesByState: Object.freeze({ ...input.statusesByState }),
    });
  }
}
