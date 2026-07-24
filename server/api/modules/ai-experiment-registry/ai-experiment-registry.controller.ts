import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiExperimentRegistryApplicationService } from "@server/application/ai-experiment-registry/services/ai-experiment-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Experiment Registry HTTP controller — experiment management only. */
export class AiExperimentRegistryController {
  constructor(
    private readonly experimentRegistry: AiExperimentRegistryApplicationService,
  ) {}

  async registerExperiment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.experimentRegistry.registerExperiment({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listExperiments(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.experimentRegistry.listExperiments();
    return createJsonResponse(context, result.value);
  }

  async getExperiment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const experimentId = this.requireExperimentId(context);
    const result = await this.experimentRegistry.getExperiment(experimentId);
    if (!result.value) {
      throw new ApiValidationError({
        experimentId: [`Experiment not found: ${experimentId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateExperiment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const experimentId = this.requireExperimentId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.experimentRegistry.updateExperiment({
      experimentId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeExperiment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const experimentId = this.requireExperimentId(context);
    const result = await this.experimentRegistry.deleteExperiment(experimentId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.experimentRegistry.findExperimentByName(name);
    if (!result.value.experiment) {
      throw new ApiValidationError({ name: [`Experiment not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.experimentRegistry.listExperimentsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.experimentRegistry.getExperimentRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireExperimentId(context: ApiRequestContext): string {
    const experimentId = readString(context.params.experimentId);
    if (!experimentId) {
      throw new ApiValidationError({ experimentId: ["experimentId is required"] });
    }
    return experimentId;
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
