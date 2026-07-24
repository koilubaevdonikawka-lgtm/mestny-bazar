/**
 * Metrics Management — system metric registration and retrieval only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IMetricAggregator } from "@server/application/metrics-management/contracts/metric-aggregator.contract";
import type { IMetricCalculator } from "@server/application/metrics-management/contracts/metric-calculator.contract";
import type { IMetricExporter } from "@server/application/metrics-management/contracts/metric-exporter.contract";
import type { IMetricRepository } from "@server/application/metrics-management/contracts/metric-repository.contract";
import type { IMetricRetentionPolicy } from "@server/application/metrics-management/contracts/metric-retention-policy.contract";
import {
  createMetricDefinition,
  createMetricValue,
  type AggregateMetricsInput,
  type AggregateMetricsResult,
  type ExportMetricsResult,
  type ListMetricsResult,
  type MetricDefinition,
  type MetricStatistics,
  type MetricValue,
  type RecordMetricValueInput,
  type RegisterMetricInput,
} from "@server/application/metrics-management/models/metric.model";
import type { IIdGenerator } from "@server/application/ports";

export class MetricsManagementService {
  constructor(
    private readonly metricRepository: IMetricRepository,
    private readonly metricAggregator: IMetricAggregator,
    private readonly metricCalculator: IMetricCalculator,
    private readonly metricExporter: IMetricExporter,
    private readonly retentionPolicy: IMetricRetentionPolicy,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerMetric(input: RegisterMetricInput): Promise<MetricDefinition> {
    const metric = createMetricDefinition({
      metricId: this.idGenerator.generate(),
      name: input.name,
      unit: input.unit,
      description: input.description,
      source: input.source,
    });

    await this.metricRepository.saveMetric(metric);
    return metric;
  }

  async recordMetricValue(input: RecordMetricValueInput): Promise<MetricValue> {
    const metricId = input.metricId.trim();
    if (!(await this.metricRepository.findMetricById(metricId))) {
      throw new Error(`Metric not found: ${metricId}`);
    }

    const value = createMetricValue({
      valueId: this.idGenerator.generate(),
      metricId,
      value: input.value,
      labels: input.labels,
      recordedAt: input.recordedAt,
    });

    if (!this.retentionPolicy.shouldRetainValue(value)) {
      throw new Error("Metric value rejected by retention policy.");
    }

    await this.metricRepository.saveValue(value);
    await this.enforceRetentionLimit(metricId);
    return value;
  }

  async getMetric(metricId: string): Promise<MetricDefinition | null> {
    return this.metricRepository.findMetricById(metricId.trim());
  }

  async listMetrics(): Promise<ListMetricsResult> {
    const metrics = Object.freeze(
      [...(await this.metricRepository.findAllMetrics())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );

    return Object.freeze({
      metrics,
      total: metrics.length,
    });
  }

  async aggregateMetrics(input: AggregateMetricsInput): Promise<AggregateMetricsResult> {
    const metricIds = input.metricIds?.length
      ? input.metricIds.map((metricId) => metricId.trim())
      : (await this.metricRepository.findAllMetrics()).map((metric) => metric.metricId);

    const numericValues: number[] = [];
    for (const metricId of metricIds) {
      const values = await this.filterValuesByRange(
        await this.metricRepository.findValuesByMetricId(metricId),
        input.from,
        input.to,
      );
      numericValues.push(...values.map((entry) => entry.value));
    }

    return Object.freeze({
      aggregation: input.aggregation,
      metricIds: Object.freeze([...metricIds]),
      value: this.metricAggregator.aggregate(numericValues, input.aggregation),
      valueCount: numericValues.length,
    });
  }

  async getMetricStatistics(metricId: string): Promise<MetricStatistics> {
    const normalizedMetricId = metricId.trim();
    if (!(await this.metricRepository.findMetricById(normalizedMetricId))) {
      throw new Error(`Metric not found: ${normalizedMetricId}`);
    }

    const values = await this.metricRepository.findValuesByMetricId(normalizedMetricId);
    return this.metricCalculator.calculateStatistics(normalizedMetricId, values);
  }

  async deleteMetric(metricId: string): Promise<{ metricId: string; deleted: boolean }> {
    const normalizedMetricId = metricId.trim();
    if (!(await this.metricRepository.findMetricById(normalizedMetricId))) {
      throw new Error(`Metric not found: ${normalizedMetricId}`);
    }

    await this.metricRepository.deleteValuesByMetricId(normalizedMetricId);
    await this.metricRepository.deleteMetric(normalizedMetricId);
    return Object.freeze({ metricId: normalizedMetricId, deleted: true });
  }

  async exportMetrics(): Promise<ExportMetricsResult> {
    const metrics = await this.metricRepository.findAllMetrics();
    const valuesByMetricId: Record<string, readonly MetricValue[]> = {};

    for (const metric of metrics) {
      valuesByMetricId[metric.metricId] = await this.metricRepository.findValuesByMetricId(
        metric.metricId,
      );
    }

    const payload = await this.metricExporter.export(metrics, valuesByMetricId);
    return Object.freeze({
      format: "json",
      payload,
      count: metrics.length,
    });
  }

  private async enforceRetentionLimit(metricId: string): Promise<void> {
    const maxValues = this.retentionPolicy.getMaxValuesPerMetric();
    const values = await this.metricRepository.findValuesByMetricId(metricId);
    if (values.length <= maxValues) {
      return;
    }

    const toRemove = values.length - maxValues;
    const oldest = [...values]
      .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))
      .slice(0, toRemove);

    for (const entry of oldest) {
      await this.metricRepository.deleteValue(entry.valueId);
    }
  }

  private async filterValuesByRange(
    values: readonly MetricValue[],
    from?: string,
    to?: string,
  ): Promise<readonly MetricValue[]> {
    return Object.freeze(
      values.filter((entry) => {
        if (from && entry.recordedAt < from) {
          return false;
        }
        if (to && entry.recordedAt > to) {
          return false;
        }
        return true;
      }),
    );
  }
}
