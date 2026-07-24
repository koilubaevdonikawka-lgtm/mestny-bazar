import type { IMonitoringStatisticsProvider } from "@server/application/ai-agent-monitoring/contracts/monitoring-statistics-provider.contract";
import type { MonitoringStatistics } from "@server/application/ai-agent-monitoring/models/monitoring.model";

/** Default in-memory monitoring statistics provider. */
export class DefaultMonitoringStatisticsProvider implements IMonitoringStatisticsProvider {
  async getStatistics(input: {
    totalEvents: number;
    totalAgents: number;
    totalActivities: number;
    lastEventAt: string | null;
  }): Promise<MonitoringStatistics> {
    return Object.freeze({
      totalEvents: input.totalEvents,
      totalAgents: input.totalAgents,
      totalActivities: input.totalActivities,
      lastEventAt: input.lastEventAt,
    });
  }
}
