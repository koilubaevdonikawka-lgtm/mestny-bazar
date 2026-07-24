import type { IMonitoringEventRepository } from "@server/application/ai-agent-monitoring/contracts/monitoring-event-repository.contract";
import type { MonitoringEvent } from "@server/application/ai-agent-monitoring/models/monitoring.model";

/** In-memory monitoring event store. */
export class MonitoringEventRepository implements IMonitoringEventRepository {
  private readonly events = new Map<string, MonitoringEvent>();
  private readonly eventsByAgentId = new Map<string, Set<string>>();

  async save(event: MonitoringEvent): Promise<void> {
    this.events.set(event.eventId, event);
    const agentSet = this.eventsByAgentId.get(event.agentId) ?? new Set<string>();
    agentSet.add(event.eventId);
    this.eventsByAgentId.set(event.agentId, agentSet);
  }

  async findById(eventId: string): Promise<MonitoringEvent | null> {
    return this.events.get(eventId.trim()) ?? null;
  }

  async findAll(): Promise<readonly MonitoringEvent[]> {
    return Object.freeze([...this.events.values()]);
  }

  async findByAgentId(agentId: string): Promise<readonly MonitoringEvent[]> {
    const eventIds = this.eventsByAgentId.get(agentId.trim());
    if (!eventIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...eventIds]
        .map((eventId) => this.events.get(eventId))
        .filter((event): event is MonitoringEvent => event !== undefined),
    );
  }
}
