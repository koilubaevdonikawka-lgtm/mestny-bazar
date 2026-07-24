import type {
  AggregateMetricsInput,
  AggregateMetricsResult,
  ExportMetricsResult,
  ListMetricsResult,
  MetricDefinition,
  MetricStatistics,
  MetricValue,
  RecordMetricValueInput,
  RegisterMetricInput,
} from "@server/application/metrics-management/models/metric.model";
import type { MetricsManagementService } from "@server/application/metrics-management/services/metrics-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterMetricUseCase {
  constructor(private readonly metrics: MetricsManagementService) {}

  execute(input: RegisterMetricInput): Promise<UseCaseResult<MetricDefinition>> {
    return this.metrics.registerMetric(input).then(useCaseResult);
  }
}

export class RecordMetricValueUseCase {
  constructor(private readonly metrics: MetricsManagementService) {}

  execute(input: RecordMetricValueInput): Promise<UseCaseResult<MetricValue>> {
    return this.metrics.recordMetricValue(input).then(useCaseResult);
  }
}

export class GetMetricUseCase {
  constructor(private readonly metrics: MetricsManagementService) {}

  execute(metricId: string): Promise<UseCaseResult<MetricDefinition | null>> {
    return this.metrics.getMetric(metricId).then(useCaseResult);
  }
}

export class ListMetricsUseCase {
  constructor(private readonly metrics: MetricsManagementService) {}

  execute(): Promise<UseCaseResult<ListMetricsResult>> {
    return this.metrics.listMetrics().then(useCaseResult);
  }
}

export class AggregateMetricsUseCase {
  constructor(private readonly metrics: MetricsManagementService) {}

  execute(input: AggregateMetricsInput): Promise<UseCaseResult<AggregateMetricsResult>> {
    return this.metrics.aggregateMetrics(input).then(useCaseResult);
  }
}

export class GetMetricStatisticsUseCase {
  constructor(private readonly metrics: MetricsManagementService) {}

  execute(metricId: string): Promise<UseCaseResult<MetricStatistics>> {
    return this.metrics.getMetricStatistics(metricId).then(useCaseResult);
  }
}

export class DeleteMetricUseCase {
  constructor(private readonly metrics: MetricsManagementService) {}

  execute(metricId: string): Promise<UseCaseResult<{ metricId: string; deleted: boolean }>> {
    return this.metrics.deleteMetric(metricId).then(useCaseResult);
  }
}

export class ExportMetricsUseCase {
  constructor(private readonly metrics: MetricsManagementService) {}

  execute(): Promise<UseCaseResult<ExportMetricsResult>> {
    return this.metrics.exportMetrics().then(useCaseResult);
  }
}
