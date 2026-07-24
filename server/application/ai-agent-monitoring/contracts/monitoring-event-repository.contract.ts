import type { MonitoringEvent } from "@server/application/ai-agent-monitoring/models/monitoring.model";

export interface IMonitoringEventRepository {
  save(event: MonitoringEvent): Promise<void>;
  findById(eventId: string): Promise<MonitoringEvent | null>;
  findAll(): Promise<readonly MonitoringEvent[]>;
  findByAgentId(agentId: string): Promise<readonly MonitoringEvent[]>;
}
