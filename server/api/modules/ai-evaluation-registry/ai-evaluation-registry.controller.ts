import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiEvaluationRegistryApplicationService } from "@server/application/ai-evaluation-registry/services/ai-evaluation-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Evaluation Registry HTTP controller — evaluation management only. */
export class AiEvaluationRegistryController {
  constructor(
    private readonly evaluationRegistry: AiEvaluationRegistryApplicationService,
  ) {}

  async registerEvaluation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.evaluationRegistry.registerEvaluation({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listEvaluations(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.evaluationRegistry.listEvaluations();
    return createJsonResponse(context, result.value);
  }

  async getEvaluation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const evaluationId = this.requireEvaluationId(context);
    const result = await this.evaluationRegistry.getEvaluation(evaluationId);
    if (!result.value) {
      throw new ApiValidationError({
        evaluationId: [`Evaluation not found: ${evaluationId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateEvaluation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const evaluationId = this.requireEvaluationId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.evaluationRegistry.updateEvaluation({
      evaluationId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeEvaluation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const evaluationId = this.requireEvaluationId(context);
    const result = await this.evaluationRegistry.deleteEvaluation(evaluationId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.evaluationRegistry.findEvaluationByName(name);
    if (!result.value.evaluation) {
      throw new ApiValidationError({ name: [`Evaluation not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.evaluationRegistry.listEvaluationsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.evaluationRegistry.getEvaluationRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireEvaluationId(context: ApiRequestContext): string {
    const evaluationId = readString(context.params.evaluationId);
    if (!evaluationId) {
      throw new ApiValidationError({ evaluationId: ["evaluationId is required"] });
    }
    return evaluationId;
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
