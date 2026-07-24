import type { MonitoringMetrics } from "@server/application/ai-agent-monitoring/models/monitoring.model";

export interface IMonitoringMetricsProvider {
  getMetrics(input: {
    totalEvents: number;
    totalStatuses: number;
    totalActivities: number;
    eventsBySeverity: Readonly<Record<"info" | "warning" | "error", number>>;
    statusesByState: Readonly<Record<"online" | "offline" | "idle" | "busy" | "error", number>>;
  }): Promise<MonitoringMetrics>;
}
