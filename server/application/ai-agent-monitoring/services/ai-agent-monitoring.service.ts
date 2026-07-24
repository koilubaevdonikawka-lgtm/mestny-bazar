/**
 * AI Agent Monitoring — unified monitoring for AI agents.
 *
 * Fully independent module. No business logic or domain knowledge.
 * Does not manage agents or make decisions.
 */
import type { IAgentActivityRepository } from "@server/application/ai-agent-monitoring/contracts/agent-activity-repository.contract";
import type { IAgentStatusRepository } from "@server/application/ai-agent-monitoring/contracts/agent-status-repository.contract";
import type { IMonitoringEventRepository } from "@server/application/ai-agent-monitoring/contracts/monitoring-event-repository.contract";
import type { IMonitoringMetricsProvider } from "@server/application/ai-agent-monitoring/contracts/monitoring-metrics-provider.contract";
import type { IMonitoringStatisticsProvider } from "@server/application/ai-agent-monitoring/contracts/monitoring-statistics-provider.contract";
import {
  createAgentActivityEntry,
  createAgentStatus,
  createMonitoringEvent,
  type AgentStatus,
  type GetAgentActivityHistoryInput,
  type GetAgentActivityHistoryResult,
  type ListAgentStatusesResult,
  type ListMonitoringEventsResult,
  type MonitoringEvent,
  type MonitoringMetrics,
  type MonitoringStatistics,
  type RegisterAgentStatusInput,
  type RegisterMonitoringEventInput,
} from "@server/application/ai-agent-monitoring/models/monitoring.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiAgentMonitoringService {
  constructor(
    private readonly eventRepository: IMonitoringEventRepository,
    private readonly statusRepository: IAgentStatusRepository,
    private readonly activityRepository: IAgentActivityRepository,
    private readonly metricsProvider: IMonitoringMetricsProvider,
    private readonly statisticsProvider: IMonitoringStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerMonitoringEvent(input: RegisterMonitoringEventInput): Promise<MonitoringEvent> {
    const agentId = input.agentId.trim();
    const type = input.type.trim();

    if (!agentId) {
      throw new Error("Agent id is required.");
    }
    if (!type) {
      throw new Error("Monitoring event type is required.");
    }

    const event = createMonitoringEvent({
      eventId: this.idGenerator.generate(),
      agentId,
      type,
      severity: input.severity,
      payload: input.payload,
    });

    await this.eventRepository.save(event);
    await this.activityRepository.save(
      createAgentActivityEntry({
        activityId: this.idGenerator.generate(),
        agentId,
        action: `event:${type}`,
        payload: input.payload,
      }),
    );

    return event;
  }

  async getMonitoringEvent(eventId: string): Promise<MonitoringEvent | null> {
    return this.eventRepository.findById(eventId.trim());
  }

  async listMonitoringEvents(): Promise<ListMonitoringEventsResult> {
    const events = Object.freeze(
      [...(await this.eventRepository.findAll())].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    );
    return Object.freeze({ events, total: events.length });
  }

  async registerAgentStatus(input: RegisterAgentStatusInput): Promise<AgentStatus> {
    const agentId = input.agentId.trim();

    if (!agentId) {
      throw new Error("Agent id is required.");
    }

    const status = createAgentStatus({
      statusId: this.idGenerator.generate(),
      agentId,
      status: input.status,
      details: input.details,
    });

    await this.statusRepository.save(status);
    await this.activityRepository.save(
      createAgentActivityEntry({
        activityId: this.idGenerator.generate(),
        agentId,
        action: `status:${input.status}`,
        payload: Object.freeze({ details: status.details }),
      }),
    );

    return status;
  }

  async listAgentStatuses(): Promise<ListAgentStatusesResult> {
    const allStatuses = await this.statusRepository.findAll();
    const latestByAgent = new Map<string, AgentStatus>();

    for (const status of allStatuses) {
      const existing = latestByAgent.get(status.agentId);
      if (!existing || status.updatedAt.localeCompare(existing.updatedAt) > 0) {
        latestByAgent.set(status.agentId, status);
      }
    }

    const statuses = Object.freeze(
      [...latestByAgent.values()].sort((left, right) => left.agentId.localeCompare(right.agentId)),
    );
    return Object.freeze({ statuses, total: statuses.length });
  }

  async getAgentActivityHistory(
    input: GetAgentActivityHistoryInput = {},
  ): Promise<GetAgentActivityHistoryResult> {
    const agentId = input.agentId?.trim() ?? null;
    const entries = Object.freeze(
      [
        ...(agentId
          ? await this.activityRepository.findByAgentId(agentId)
          : await this.activityRepository.findAll()),
      ].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );

    return Object.freeze({ entries, total: entries.length, agentId });
  }

  async getMonitoringMetrics(): Promise<MonitoringMetrics> {
    const events = await this.eventRepository.findAll();
    const statuses = await this.statusRepository.findAll();
    const activities = await this.activityRepository.findAll();

    const eventsBySeverity = Object.freeze({
      info: events.filter((event) => event.severity === "info").length,
      warning: events.filter((event) => event.severity === "warning").length,
      error: events.filter((event) => event.severity === "error").length,
    });

    const statusesByState = Object.freeze({
      online: statuses.filter((status) => status.status === "online").length,
      offline: statuses.filter((status) => status.status === "offline").length,
      idle: statuses.filter((status) => status.status === "idle").length,
      busy: statuses.filter((status) => status.status === "busy").length,
      error: statuses.filter((status) => status.status === "error").length,
    });

    return this.metricsProvider.getMetrics({
      totalEvents: events.length,
      totalStatuses: statuses.length,
      totalActivities: activities.length,
      eventsBySeverity,
      statusesByState,
    });
  }

  async getMonitoringStatistics(): Promise<MonitoringStatistics> {
    const events = await this.eventRepository.findAll();
    const activities = await this.activityRepository.findAll();
    const agentIds = new Set<string>();

    for (const event of events) {
      agentIds.add(event.agentId);
    }
    for (const activity of activities) {
      agentIds.add(activity.agentId);
    }

    const lastEventAt =
      events.length > 0
        ? [...events].sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0]
            ?.createdAt ?? null
        : null;

    return this.statisticsProvider.getStatistics({
      totalEvents: events.length,
      totalAgents: agentIds.size,
      totalActivities: activities.length,
      lastEventAt,
    });
  }
}
