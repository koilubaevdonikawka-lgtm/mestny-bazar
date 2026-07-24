import type {
  MetricDefinition,
  MetricValue,
} from "@server/application/metrics-management/models/metric.model";

export interface IMetricRepository {
  saveMetric(metric: MetricDefinition): Promise<void>;
  findMetricById(metricId: string): Promise<MetricDefinition | null>;
  deleteMetric(metricId: string): Promise<void>;
  findAllMetrics(): Promise<readonly MetricDefinition[]>;
  saveValue(value: MetricValue): Promise<void>;
  findValuesByMetricId(metricId: string): Promise<readonly MetricValue[]>;
  deleteValue(valueId: string): Promise<void>;
  deleteValuesByMetricId(metricId: string): Promise<void>;
}
