import type { IMetricAggregator } from "@server/application/metrics-management/contracts/metric-aggregator.contract";
import type { IMetricCalculator } from "@server/application/metrics-management/contracts/metric-calculator.contract";
import type { IMetricExporter } from "@server/application/metrics-management/contracts/metric-exporter.contract";
import type { IMetricRepository } from "@server/application/metrics-management/contracts/metric-repository.contract";
import type { IMetricRetentionPolicy } from "@server/application/metrics-management/contracts/metric-retention-policy.contract";
import {
  AggregateMetricsUseCase,
  DeleteMetricUseCase,
  ExportMetricsUseCase,
  GetMetricStatisticsUseCase,
  GetMetricUseCase,
  ListMetricsUseCase,
  MetricsManagementApplicationService,
  MetricsManagementService,
  RecordMetricValueUseCase,
  RegisterMetricUseCase,
} from "@server/application/metrics-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultMetricAggregator } from "@server/infrastructure/metrics-management/default-metric.aggregator";
import { DefaultMetricCalculator } from "@server/infrastructure/metrics-management/default-metric.calculator";
import { DefaultMetricRetentionPolicy } from "@server/infrastructure/metrics-management/default-metric-retention.policy";
import { JsonMetricExporter } from "@server/infrastructure/metrics-management/json-metric.exporter";
import { MetricRepository } from "@server/infrastructure/metrics-management/metric.repository";

/** Registers metrics management services and use cases. */
export function registerMetricsManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.MetricsManagementMetricRepository, () =>
    new MetricRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.MetricsManagementMetricAggregator, () =>
    new DefaultMetricAggregator(),
  );

  registry.registerSingleton(InfrastructureTokens.MetricsManagementMetricCalculator, () =>
    new DefaultMetricCalculator(),
  );

  registry.registerSingleton(InfrastructureTokens.MetricsManagementMetricExporter, () =>
    new JsonMetricExporter(),
  );

  registry.registerSingleton(InfrastructureTokens.MetricsManagementMetricRetentionPolicy, () =>
    new DefaultMetricRetentionPolicy(),
  );

  registry.registerTransient(InfrastructureTokens.MetricsManagementService, (provider) =>
    new MetricsManagementService(
      provider.resolve<IMetricRepository>(InfrastructureTokens.MetricsManagementMetricRepository),
      provider.resolve<IMetricAggregator>(InfrastructureTokens.MetricsManagementMetricAggregator),
      provider.resolve<IMetricCalculator>(InfrastructureTokens.MetricsManagementMetricCalculator),
      provider.resolve<IMetricExporter>(InfrastructureTokens.MetricsManagementMetricExporter),
      provider.resolve<IMetricRetentionPolicy>(
        InfrastructureTokens.MetricsManagementMetricRetentionPolicy,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.MetricsManagementRegisterMetricUseCase,
    (provider) =>
      new RegisterMetricUseCase(
        provider.resolve<MetricsManagementService>(InfrastructureTokens.MetricsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.MetricsManagementRecordMetricValueUseCase,
    (provider) =>
      new RecordMetricValueUseCase(
        provider.resolve<MetricsManagementService>(InfrastructureTokens.MetricsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.MetricsManagementGetMetricUseCase,
    (provider) =>
      new GetMetricUseCase(
        provider.resolve<MetricsManagementService>(InfrastructureTokens.MetricsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.MetricsManagementListMetricsUseCase,
    (provider) =>
      new ListMetricsUseCase(
        provider.resolve<MetricsManagementService>(InfrastructureTokens.MetricsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.MetricsManagementAggregateMetricsUseCase,
    (provider) =>
      new AggregateMetricsUseCase(
        provider.resolve<MetricsManagementService>(InfrastructureTokens.MetricsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.MetricsManagementGetMetricStatisticsUseCase,
    (provider) =>
      new GetMetricStatisticsUseCase(
        provider.resolve<MetricsManagementService>(InfrastructureTokens.MetricsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.MetricsManagementDeleteMetricUseCase,
    (provider) =>
      new DeleteMetricUseCase(
        provider.resolve<MetricsManagementService>(InfrastructureTokens.MetricsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.MetricsManagementExportMetricsUseCase,
    (provider) =>
      new ExportMetricsUseCase(
        provider.resolve<MetricsManagementService>(InfrastructureTokens.MetricsManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.MetricsManagementApplicationService,
    (provider) =>
      new MetricsManagementApplicationService(
        provider.resolve<RegisterMetricUseCase>(
          InfrastructureTokens.MetricsManagementRegisterMetricUseCase,
        ),
        provider.resolve<RecordMetricValueUseCase>(
          InfrastructureTokens.MetricsManagementRecordMetricValueUseCase,
        ),
        provider.resolve<GetMetricUseCase>(InfrastructureTokens.MetricsManagementGetMetricUseCase),
        provider.resolve<ListMetricsUseCase>(
          InfrastructureTokens.MetricsManagementListMetricsUseCase,
        ),
        provider.resolve<AggregateMetricsUseCase>(
          InfrastructureTokens.MetricsManagementAggregateMetricsUseCase,
        ),
        provider.resolve<GetMetricStatisticsUseCase>(
          InfrastructureTokens.MetricsManagementGetMetricStatisticsUseCase,
        ),
        provider.resolve<DeleteMetricUseCase>(
          InfrastructureTokens.MetricsManagementDeleteMetricUseCase,
        ),
        provider.resolve<ExportMetricsUseCase>(
          InfrastructureTokens.MetricsManagementExportMetricsUseCase,
        ),
      ),
  );
}
