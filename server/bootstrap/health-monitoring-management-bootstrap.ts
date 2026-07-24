import type { IHealthCheckExecutor } from "@server/application/health-monitoring-management/contracts/health-check-executor.contract";
import type { IHealthCheckRegistry } from "@server/application/health-monitoring-management/contracts/health-check-registry.contract";
import type { IHealthCheckRepository } from "@server/application/health-monitoring-management/contracts/health-check-repository.contract";
import type { IHealthHistoryRepository } from "@server/application/health-monitoring-management/contracts/health-history-repository.contract";
import type { IHealthStatusAggregator } from "@server/application/health-monitoring-management/contracts/health-status-aggregator.contract";
import {
  GetComponentHealthUseCase,
  GetHealthHistoryUseCase,
  GetSystemHealthUseCase,
  HealthMonitoringManagementApplicationService,
  HealthMonitoringManagementService,
  ListHealthChecksUseCase,
  RegisterHealthCheckUseCase,
  RemoveHealthCheckUseCase,
  RunAllHealthChecksUseCase,
  RunHealthCheckUseCase,
} from "@server/application/health-monitoring-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultHealthCheckExecutor } from "@server/infrastructure/health-monitoring-management/default-health-check.executor";
import { DefaultHealthStatusAggregator } from "@server/infrastructure/health-monitoring-management/default-health-status.aggregator";
import { HealthCheckRegistry } from "@server/infrastructure/health-monitoring-management/health-check.registry";
import { HealthCheckRepository } from "@server/infrastructure/health-monitoring-management/health-check.repository";
import { HealthHistoryRepository } from "@server/infrastructure/health-monitoring-management/health-history.repository";

/** Registers health monitoring management services and use cases. */
export function registerHealthMonitoringManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.HealthMonitoringManagementCheckRepository, () =>
    new HealthCheckRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.HealthMonitoringManagementHistoryRepository, () =>
    new HealthHistoryRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.HealthMonitoringManagementCheckRegistry,
    (provider) =>
      new HealthCheckRegistry(
        provider.resolve<IHealthCheckRepository>(
          InfrastructureTokens.HealthMonitoringManagementCheckRepository,
        ),
      ),
  );

  registry.registerSingleton(InfrastructureTokens.HealthMonitoringManagementCheckExecutor, () =>
    new DefaultHealthCheckExecutor(),
  );

  registry.registerSingleton(InfrastructureTokens.HealthMonitoringManagementStatusAggregator, () =>
    new DefaultHealthStatusAggregator(),
  );

  registry.registerTransient(InfrastructureTokens.HealthMonitoringManagementService, (provider) =>
    new HealthMonitoringManagementService(
      provider.resolve<IHealthCheckRepository>(
        InfrastructureTokens.HealthMonitoringManagementCheckRepository,
      ),
      provider.resolve<IHealthCheckRegistry>(
        InfrastructureTokens.HealthMonitoringManagementCheckRegistry,
      ),
      provider.resolve<IHealthCheckExecutor>(
        InfrastructureTokens.HealthMonitoringManagementCheckExecutor,
      ),
      provider.resolve<IHealthStatusAggregator>(
        InfrastructureTokens.HealthMonitoringManagementStatusAggregator,
      ),
      provider.resolve<IHealthHistoryRepository>(
        InfrastructureTokens.HealthMonitoringManagementHistoryRepository,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementRegisterHealthCheckUseCase,
    (provider) =>
      new RegisterHealthCheckUseCase(
        provider.resolve<HealthMonitoringManagementService>(
          InfrastructureTokens.HealthMonitoringManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementRemoveHealthCheckUseCase,
    (provider) =>
      new RemoveHealthCheckUseCase(
        provider.resolve<HealthMonitoringManagementService>(
          InfrastructureTokens.HealthMonitoringManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementRunHealthCheckUseCase,
    (provider) =>
      new RunHealthCheckUseCase(
        provider.resolve<HealthMonitoringManagementService>(
          InfrastructureTokens.HealthMonitoringManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementRunAllHealthChecksUseCase,
    (provider) =>
      new RunAllHealthChecksUseCase(
        provider.resolve<HealthMonitoringManagementService>(
          InfrastructureTokens.HealthMonitoringManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementGetComponentHealthUseCase,
    (provider) =>
      new GetComponentHealthUseCase(
        provider.resolve<HealthMonitoringManagementService>(
          InfrastructureTokens.HealthMonitoringManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementGetSystemHealthUseCase,
    (provider) =>
      new GetSystemHealthUseCase(
        provider.resolve<HealthMonitoringManagementService>(
          InfrastructureTokens.HealthMonitoringManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementGetHealthHistoryUseCase,
    (provider) =>
      new GetHealthHistoryUseCase(
        provider.resolve<HealthMonitoringManagementService>(
          InfrastructureTokens.HealthMonitoringManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementListHealthChecksUseCase,
    (provider) =>
      new ListHealthChecksUseCase(
        provider.resolve<HealthMonitoringManagementService>(
          InfrastructureTokens.HealthMonitoringManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.HealthMonitoringManagementApplicationService,
    (provider) =>
      new HealthMonitoringManagementApplicationService(
        provider.resolve<RegisterHealthCheckUseCase>(
          InfrastructureTokens.HealthMonitoringManagementRegisterHealthCheckUseCase,
        ),
        provider.resolve<RemoveHealthCheckUseCase>(
          InfrastructureTokens.HealthMonitoringManagementRemoveHealthCheckUseCase,
        ),
        provider.resolve<RunHealthCheckUseCase>(
          InfrastructureTokens.HealthMonitoringManagementRunHealthCheckUseCase,
        ),
        provider.resolve<RunAllHealthChecksUseCase>(
          InfrastructureTokens.HealthMonitoringManagementRunAllHealthChecksUseCase,
        ),
        provider.resolve<GetComponentHealthUseCase>(
          InfrastructureTokens.HealthMonitoringManagementGetComponentHealthUseCase,
        ),
        provider.resolve<GetSystemHealthUseCase>(
          InfrastructureTokens.HealthMonitoringManagementGetSystemHealthUseCase,
        ),
        provider.resolve<GetHealthHistoryUseCase>(
          InfrastructureTokens.HealthMonitoringManagementGetHealthHistoryUseCase,
        ),
        provider.resolve<ListHealthChecksUseCase>(
          InfrastructureTokens.HealthMonitoringManagementListHealthChecksUseCase,
        ),
      ),
  );
}
