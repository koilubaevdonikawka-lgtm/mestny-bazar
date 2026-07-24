import type {
  GetAgentActivityHistoryInput,
  RegisterAgentStatusInput,
  RegisterMonitoringEventInput,
} from "@server/application/ai-agent-monitoring/models/monitoring.model";
import {
  GetAgentActivityHistoryUseCase,
  GetMonitoringEventUseCase,
  GetMonitoringMetricsUseCase,
  GetMonitoringStatisticsUseCase,
  ListAgentStatusesUseCase,
  ListMonitoringEventsUseCase,
  RegisterAgentStatusUseCase,
  RegisterMonitoringEventUseCase,
} from "@server/application/ai-agent-monitoring/use-cases/ai-agent-monitoring.use-cases";

/** Application facade for AI Agent Monitoring scenario. */
export class AiAgentMonitoringApplicationService {
  constructor(
    private readonly registerMonitoringEventUseCase: RegisterMonitoringEventUseCase,
    private readonly getMonitoringEventUseCase: GetMonitoringEventUseCase,
    private readonly listMonitoringEventsUseCase: ListMonitoringEventsUseCase,
    private readonly registerAgentStatusUseCase: RegisterAgentStatusUseCase,
    private readonly listAgentStatusesUseCase: ListAgentStatusesUseCase,
    private readonly getAgentActivityHistoryUseCase: GetAgentActivityHistoryUseCase,
    private readonly getMonitoringMetricsUseCase: GetMonitoringMetricsUseCase,
    private readonly getMonitoringStatisticsUseCase: GetMonitoringStatisticsUseCase,
  ) {}

  registerMonitoringEvent(input: RegisterMonitoringEventInput) {
    return this.registerMonitoringEventUseCase.execute(input);
  }

  getMonitoringEvent(eventId: string) {
    return this.getMonitoringEventUseCase.execute(eventId);
  }

  listMonitoringEvents() {
    return this.listMonitoringEventsUseCase.execute();
  }

  registerAgentStatus(input: RegisterAgentStatusInput) {
    return this.registerAgentStatusUseCase.execute(input);
  }

  listAgentStatuses() {
    return this.listAgentStatusesUseCase.execute();
  }

  getAgentActivityHistory(input: GetAgentActivityHistoryInput = {}) {
    return this.getAgentActivityHistoryUseCase.execute(input);
  }

  getMonitoringMetrics() {
    return this.getMonitoringMetricsUseCase.execute();
  }

  getMonitoringStatistics() {
    return this.getMonitoringStatisticsUseCase.execute();
  }
}
