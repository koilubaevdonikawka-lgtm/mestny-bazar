import { ApiValidationError } from "@server/api/errors/api.errors";
import type { MetricsManagementApplicationService } from "@server/application/metrics-management/services/metrics-management-application.service";
import { isMetricAggregationType } from "@server/application/metrics-management/models/metric.model";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Metrics HTTP controller — system metric registration and retrieval only. */
export class MetricsManagementController {
  constructor(private readonly metrics: MetricsManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const unit = readString(body.unit);
    const description = readString(body.description);
    const source = readString(body.source);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const result = await this.metrics.registerMetric({
      name,
      unit: unit ?? undefined,
      description: description ?? undefined,
      source: source ?? undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async recordValue(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const metricId = this.requireMetricId(context);
    const body = readRecordBody(context.body);
    const valueRaw = body.value;
    const recordedAt = readString(body.recordedAt);
    const labels = this.readLabels(body.labels);

    if (typeof valueRaw !== "number" || Number.isNaN(valueRaw)) {
      throw new ApiValidationError({ value: ["value is required and must be a number"] });
    }

    const result = await this.metrics.recordMetricValue({
      metricId,
      value: valueRaw,
      labels,
      recordedAt: recordedAt ?? undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.metrics.listMetrics();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const metricId = this.requireMetricId(context);
    const result = await this.metrics.getMetric(metricId);
    if (!result.value) {
      throw new ApiValidationError({ metricId: [`Metric not found: ${metricId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const metricId = this.requireMetricId(context);
    const result = await this.metrics.getMetricStatistics(metricId);
    return createJsonResponse(context, result.value);
  }

  async aggregate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const aggregation = readString(body.aggregation);
    const from = readString(body.from);
    const to = readString(body.to);
    const metricIds = this.readMetricIds(body.metricIds);

    if (!aggregation || !isMetricAggregationType(aggregation)) {
      throw new ApiValidationError({
        aggregation: ["aggregation is required and must be one of: sum, avg, min, max, count"],
      });
    }

    const result = await this.metrics.aggregateMetrics({
      metricIds,
      aggregation,
      from: from ?? undefined,
      to: to ?? undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const metricId = this.requireMetricId(context);
    const result = await this.metrics.deleteMetric(metricId);
    return createJsonResponse(context, result.value);
  }

  async export(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.metrics.exportMetrics();
    return createJsonResponse(context, result.value);
  }

  private requireMetricId(context: ApiRequestContext): string {
    const metricId = readString(context.params.metricId);
    if (!metricId) {
      throw new ApiValidationError({ metricId: ["metricId is required"] });
    }
    return metricId;
  }

  private readLabels(value: unknown): Readonly<Record<string, string>> | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      throw new ApiValidationError({ labels: ["labels must be an object"] });
    }

    const labels: Record<string, string> = {};
    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (typeof entryValue !== "string") {
        throw new ApiValidationError({ labels: [`labels.${key} must be a string`] });
      }
      labels[key] = entryValue;
    }

    return labels;
  }

  private readMetricIds(value: unknown): readonly string[] | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (!Array.isArray(value)) {
      throw new ApiValidationError({ metricIds: ["metricIds must be an array of strings"] });
    }

    const metricIds: string[] = [];
    for (const entry of value) {
      if (typeof entry !== "string" || !entry.trim()) {
        throw new ApiValidationError({ metricIds: ["metricIds must be an array of strings"] });
      }
      metricIds.push(entry.trim());
    }

    return metricIds;
  }
}
