import type {
  AggregateMetricsInput,
  RecordMetricValueInput,
  RegisterMetricInput,
} from "@server/application/metrics-management/models/metric.model";
import {
  AggregateMetricsUseCase,
  DeleteMetricUseCase,
  ExportMetricsUseCase,
  GetMetricStatisticsUseCase,
  GetMetricUseCase,
  ListMetricsUseCase,
  RecordMetricValueUseCase,
  RegisterMetricUseCase,
} from "@server/application/metrics-management/use-cases/metrics-management.use-cases";

/** Application facade for metrics management scenario. */
export class MetricsManagementApplicationService {
  constructor(
    private readonly registerMetricUseCase: RegisterMetricUseCase,
    private readonly recordMetricValueUseCase: RecordMetricValueUseCase,
    private readonly getMetricUseCase: GetMetricUseCase,
    private readonly listMetricsUseCase: ListMetricsUseCase,
    private readonly aggregateMetricsUseCase: AggregateMetricsUseCase,
    private readonly getMetricStatisticsUseCase: GetMetricStatisticsUseCase,
    private readonly deleteMetricUseCase: DeleteMetricUseCase,
    private readonly exportMetricsUseCase: ExportMetricsUseCase,
  ) {}

  registerMetric(input: RegisterMetricInput) {
    return this.registerMetricUseCase.execute(input);
  }

  recordMetricValue(input: RecordMetricValueInput) {
    return this.recordMetricValueUseCase.execute(input);
  }

  getMetric(metricId: string) {
    return this.getMetricUseCase.execute(metricId);
  }

  listMetrics() {
    return this.listMetricsUseCase.execute();
  }

  aggregateMetrics(input: AggregateMetricsInput) {
    return this.aggregateMetricsUseCase.execute(input);
  }

  getMetricStatistics(metricId: string) {
    return this.getMetricStatisticsUseCase.execute(metricId);
  }

  deleteMetric(metricId: string) {
    return this.deleteMetricUseCase.execute(metricId);
  }

  exportMetrics() {
    return this.exportMetricsUseCase.execute();
  }
}
