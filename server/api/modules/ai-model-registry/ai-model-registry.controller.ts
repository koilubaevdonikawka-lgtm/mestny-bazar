import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiModelRegistryApplicationService } from "@server/application/ai-model-registry/services/ai-model-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Model Registry HTTP controller — model management only. */
export class AiModelRegistryController {
  constructor(private readonly modelRegistry: AiModelRegistryApplicationService) {}

  async registerModel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const provider = readString(body.provider);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!provider) {
      throw new ApiValidationError({ provider: ["provider is required"] });
    }

    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.modelRegistry.registerModel({
      name,
      provider,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listModels(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.modelRegistry.listModels();
    return createJsonResponse(context, result.value);
  }

  async getModel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const modelId = this.requireModelId(context);
    const result = await this.modelRegistry.getModel(modelId);
    if (!result.value) {
      throw new ApiValidationError({
        modelId: [`Model not found: ${modelId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateModel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const modelId = this.requireModelId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const provider = readString(body.provider);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.modelRegistry.updateModel({
      modelId,
      name: name ?? undefined,
      provider: provider ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeModel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const modelId = this.requireModelId(context);
    const result = await this.modelRegistry.deleteModel(modelId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.modelRegistry.findModelByName(name);
    if (!result.value.model) {
      throw new ApiValidationError({ name: [`Model not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByProvider(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const provider = readString(context.params.provider);
    if (!provider) {
      throw new ApiValidationError({ provider: ["provider is required"] });
    }
    const result = await this.modelRegistry.listModelsByProvider(provider);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.modelRegistry.getModelRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireModelId(context: ApiRequestContext): string {
    const modelId = readString(context.params.modelId);
    if (!modelId) {
      throw new ApiValidationError({ modelId: ["modelId is required"] });
    }
    return modelId;
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
