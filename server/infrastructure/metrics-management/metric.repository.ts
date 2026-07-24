import type { IMetricRepository } from "@server/application/metrics-management/contracts/metric-repository.contract";
import type {
  MetricDefinition,
  MetricValue,
} from "@server/application/metrics-management/models/metric.model";

/** In-memory metric definition and value store. */
export class MetricRepository implements IMetricRepository {
  private readonly metrics = new Map<string, MetricDefinition>();
  private readonly valuesByMetricId = new Map<string, Map<string, MetricValue>>();

  async saveMetric(metric: MetricDefinition): Promise<void> {
    this.metrics.set(metric.metricId, metric);
    if (!this.valuesByMetricId.has(metric.metricId)) {
      this.valuesByMetricId.set(metric.metricId, new Map<string, MetricValue>());
    }
  }

  async findMetricById(metricId: string): Promise<MetricDefinition | null> {
    return this.metrics.get(metricId.trim()) ?? null;
  }

  async deleteMetric(metricId: string): Promise<void> {
    this.metrics.delete(metricId.trim());
    this.valuesByMetricId.delete(metricId.trim());
  }

  async findAllMetrics(): Promise<readonly MetricDefinition[]> {
    return Object.freeze([...this.metrics.values()]);
  }

  async saveValue(value: MetricValue): Promise<void> {
    const values =
      this.valuesByMetricId.get(value.metricId) ?? new Map<string, MetricValue>();
    values.set(value.valueId, value);
    this.valuesByMetricId.set(value.metricId, values);
  }

  async findValuesByMetricId(metricId: string): Promise<readonly MetricValue[]> {
    const values = this.valuesByMetricId.get(metricId.trim());
    if (!values) {
      return Object.freeze([]);
    }

    return Object.freeze([...values.values()]);
  }

  async deleteValue(valueId: string): Promise<void> {
    for (const values of this.valuesByMetricId.values()) {
      values.delete(valueId.trim());
    }
  }

  async deleteValuesByMetricId(metricId: string): Promise<void> {
    this.valuesByMetricId.delete(metricId.trim());
  }
}
