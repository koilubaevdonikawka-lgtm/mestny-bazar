import type {
  AgentStatus,
  GetAgentActivityHistoryInput,
  GetAgentActivityHistoryResult,
  ListAgentStatusesResult,
  ListMonitoringEventsResult,
  MonitoringEvent,
  MonitoringMetrics,
  MonitoringStatistics,
  RegisterAgentStatusInput,
  RegisterMonitoringEventInput,
} from "@server/application/ai-agent-monitoring/models/monitoring.model";
import type { AiAgentMonitoringService } from "@server/application/ai-agent-monitoring/services/ai-agent-monitoring.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterMonitoringEventUseCase {
  constructor(private readonly monitoring: AiAgentMonitoringService) {}

  execute(input: RegisterMonitoringEventInput): Promise<UseCaseResult<MonitoringEvent>> {
    return this.monitoring.registerMonitoringEvent(input).then(useCaseResult);
  }
}

export class GetMonitoringEventUseCase {
  constructor(private readonly monitoring: AiAgentMonitoringService) {}

  execute(eventId: string): Promise<UseCaseResult<MonitoringEvent | null>> {
    return this.monitoring.getMonitoringEvent(eventId).then(useCaseResult);
  }
}

export class ListMonitoringEventsUseCase {
  constructor(private readonly monitoring: AiAgentMonitoringService) {}

  execute(): Promise<UseCaseResult<ListMonitoringEventsResult>> {
    return this.monitoring.listMonitoringEvents().then(useCaseResult);
  }
}

export class RegisterAgentStatusUseCase {
  constructor(private readonly monitoring: AiAgentMonitoringService) {}

  execute(input: RegisterAgentStatusInput): Promise<UseCaseResult<AgentStatus>> {
    return this.monitoring.registerAgentStatus(input).then(useCaseResult);
  }
}

export class ListAgentStatusesUseCase {
  constructor(private readonly monitoring: AiAgentMonitoringService) {}

  execute(): Promise<UseCaseResult<ListAgentStatusesResult>> {
    return this.monitoring.listAgentStatuses().then(useCaseResult);
  }
}

export class GetAgentActivityHistoryUseCase {
  constructor(private readonly monitoring: AiAgentMonitoringService) {}

  execute(
    input: GetAgentActivityHistoryInput = {},
  ): Promise<UseCaseResult<GetAgentActivityHistoryResult>> {
    return this.monitoring.getAgentActivityHistory(input).then(useCaseResult);
  }
}

export class GetMonitoringMetricsUseCase {
  constructor(private readonly monitoring: AiAgentMonitoringService) {}

  execute(): Promise<UseCaseResult<MonitoringMetrics>> {
    return this.monitoring.getMonitoringMetrics().then(useCaseResult);
  }
}

export class GetMonitoringStatisticsUseCase {
  constructor(private readonly monitoring: AiAgentMonitoringService) {}

  execute(): Promise<UseCaseResult<MonitoringStatistics>> {
    return this.monitoring.getMonitoringStatistics().then(useCaseResult);
  }
}
