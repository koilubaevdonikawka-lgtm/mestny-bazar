import type { IAgentActivityRepository } from "@server/application/ai-agent-monitoring/contracts/agent-activity-repository.contract";
import type { IAgentStatusRepository } from "@server/application/ai-agent-monitoring/contracts/agent-status-repository.contract";
import type { IMonitoringEventRepository } from "@server/application/ai-agent-monitoring/contracts/monitoring-event-repository.contract";
import type { IMonitoringMetricsProvider } from "@server/application/ai-agent-monitoring/contracts/monitoring-metrics-provider.contract";
import type { IMonitoringStatisticsProvider } from "@server/application/ai-agent-monitoring/contracts/monitoring-statistics-provider.contract";
import {
  AiAgentMonitoringApplicationService,
  AiAgentMonitoringService,
  GetAgentActivityHistoryUseCase,
  GetMonitoringEventUseCase,
  GetMonitoringMetricsUseCase,
  GetMonitoringStatisticsUseCase,
  ListAgentStatusesUseCase,
  ListMonitoringEventsUseCase,
  RegisterAgentStatusUseCase,
  RegisterMonitoringEventUseCase,
} from "@server/application/ai-agent-monitoring";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { AgentActivityRepository } from "@server/infrastructure/ai-agent-monitoring/agent-activity.repository";
import { AgentStatusRepository } from "@server/infrastructure/ai-agent-monitoring/agent-status.repository";
import { DefaultMonitoringMetricsProvider } from "@server/infrastructure/ai-agent-monitoring/default-monitoring-metrics.provider";
import { DefaultMonitoringStatisticsProvider } from "@server/infrastructure/ai-agent-monitoring/default-monitoring-statistics.provider";
import { MonitoringEventRepository } from "@server/infrastructure/ai-agent-monitoring/monitoring-event.repository";

/** Registers AI Agent Monitoring services and use cases. */
export function registerAiAgentMonitoringApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiAgentMonitoringEventRepository,
    () => new MonitoringEventRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentMonitoringStatusRepository,
    () => new AgentStatusRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentMonitoringActivityRepository,
    () => new AgentActivityRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentMonitoringMetricsProvider,
    () => new DefaultMonitoringMetricsProvider(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentMonitoringStatisticsProvider,
    () => new DefaultMonitoringStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringService,
    (provider) =>
      new AiAgentMonitoringService(
        provider.resolve<IMonitoringEventRepository>(
          InfrastructureTokens.AiAgentMonitoringEventRepository,
        ),
        provider.resolve<IAgentStatusRepository>(
          InfrastructureTokens.AiAgentMonitoringStatusRepository,
        ),
        provider.resolve<IAgentActivityRepository>(
          InfrastructureTokens.AiAgentMonitoringActivityRepository,
        ),
        provider.resolve<IMonitoringMetricsProvider>(
          InfrastructureTokens.AiAgentMonitoringMetricsProvider,
        ),
        provider.resolve<IMonitoringStatisticsProvider>(
          InfrastructureTokens.AiAgentMonitoringStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringRegisterMonitoringEventUseCase,
    (provider) =>
      new RegisterMonitoringEventUseCase(
        provider.resolve<AiAgentMonitoringService>(InfrastructureTokens.AiAgentMonitoringService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringGetMonitoringEventUseCase,
    (provider) =>
      new GetMonitoringEventUseCase(
        provider.resolve<AiAgentMonitoringService>(InfrastructureTokens.AiAgentMonitoringService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringListMonitoringEventsUseCase,
    (provider) =>
      new ListMonitoringEventsUseCase(
        provider.resolve<AiAgentMonitoringService>(InfrastructureTokens.AiAgentMonitoringService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringRegisterAgentStatusUseCase,
    (provider) =>
      new RegisterAgentStatusUseCase(
        provider.resolve<AiAgentMonitoringService>(InfrastructureTokens.AiAgentMonitoringService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringListAgentStatusesUseCase,
    (provider) =>
      new ListAgentStatusesUseCase(
        provider.resolve<AiAgentMonitoringService>(InfrastructureTokens.AiAgentMonitoringService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringGetAgentActivityHistoryUseCase,
    (provider) =>
      new GetAgentActivityHistoryUseCase(
        provider.resolve<AiAgentMonitoringService>(InfrastructureTokens.AiAgentMonitoringService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringGetMonitoringMetricsUseCase,
    (provider) =>
      new GetMonitoringMetricsUseCase(
        provider.resolve<AiAgentMonitoringService>(InfrastructureTokens.AiAgentMonitoringService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringGetMonitoringStatisticsUseCase,
    (provider) =>
      new GetMonitoringStatisticsUseCase(
        provider.resolve<AiAgentMonitoringService>(InfrastructureTokens.AiAgentMonitoringService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentMonitoringApplicationService,
    (provider) =>
      new AiAgentMonitoringApplicationService(
        provider.resolve<RegisterMonitoringEventUseCase>(
          InfrastructureTokens.AiAgentMonitoringRegisterMonitoringEventUseCase,
        ),
        provider.resolve<GetMonitoringEventUseCase>(
          InfrastructureTokens.AiAgentMonitoringGetMonitoringEventUseCase,
        ),
        provider.resolve<ListMonitoringEventsUseCase>(
          InfrastructureTokens.AiAgentMonitoringListMonitoringEventsUseCase,
        ),
        provider.resolve<RegisterAgentStatusUseCase>(
          InfrastructureTokens.AiAgentMonitoringRegisterAgentStatusUseCase,
        ),
        provider.resolve<ListAgentStatusesUseCase>(
          InfrastructureTokens.AiAgentMonitoringListAgentStatusesUseCase,
        ),
        provider.resolve<GetAgentActivityHistoryUseCase>(
          InfrastructureTokens.AiAgentMonitoringGetAgentActivityHistoryUseCase,
        ),
        provider.resolve<GetMonitoringMetricsUseCase>(
          InfrastructureTokens.AiAgentMonitoringGetMonitoringMetricsUseCase,
        ),
        provider.resolve<GetMonitoringStatisticsUseCase>(
          InfrastructureTokens.AiAgentMonitoringGetMonitoringStatisticsUseCase,
        ),
      ),
  );
}
