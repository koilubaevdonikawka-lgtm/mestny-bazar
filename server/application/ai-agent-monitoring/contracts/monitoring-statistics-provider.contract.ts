import type { MonitoringStatistics } from "@server/application/ai-agent-monitoring/models/monitoring.model";

export interface IMonitoringStatisticsProvider {
  getStatistics(input: {
    totalEvents: number;
    totalAgents: number;
    totalActivities: number;
    lastEventAt: string | null;
  }): Promise<MonitoringStatistics>;
}
