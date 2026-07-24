import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiBenchmarkRegistryApplicationService } from "@server/application/ai-benchmark-registry/services/ai-benchmark-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Benchmark Registry HTTP controller — benchmark management only. */
export class AiBenchmarkRegistryController {
  constructor(
    private readonly benchmarkRegistry: AiBenchmarkRegistryApplicationService,
  ) {}

  async registerBenchmark(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }

    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.benchmarkRegistry.registerBenchmark({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listBenchmarks(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.benchmarkRegistry.listBenchmarks();
    return createJsonResponse(context, result.value);
  }

  async getBenchmark(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const benchmarkId = this.requireBenchmarkId(context);
    const result = await this.benchmarkRegistry.getBenchmark(benchmarkId);
    if (!result.value) {
      throw new ApiValidationError({
        benchmarkId: [`Benchmark not found: ${benchmarkId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateBenchmark(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const benchmarkId = this.requireBenchmarkId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.benchmarkRegistry.updateBenchmark({
      benchmarkId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeBenchmark(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const benchmarkId = this.requireBenchmarkId(context);
    const result = await this.benchmarkRegistry.deleteBenchmark(benchmarkId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.benchmarkRegistry.findBenchmarkByName(name);
    if (!result.value.benchmark) {
      throw new ApiValidationError({ name: [`Benchmark not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.benchmarkRegistry.listBenchmarksByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.benchmarkRegistry.getBenchmarkRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireBenchmarkId(context: ApiRequestContext): string {
    const benchmarkId = readString(context.params.benchmarkId);
    if (!benchmarkId) {
      throw new ApiValidationError({ benchmarkId: ["benchmarkId is required"] });
    }
    return benchmarkId;
  }

  private readStatus(value: unknown): "active" | "inactive" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "inactive") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'inactive'"] });
  }
}
