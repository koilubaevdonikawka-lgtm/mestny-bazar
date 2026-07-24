import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiDatasetRegistryApplicationService } from "@server/application/ai-dataset-registry/services/ai-dataset-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Dataset Registry HTTP controller — dataset management only. */
export class AiDatasetRegistryController {
  constructor(private readonly datasetRegistry: AiDatasetRegistryApplicationService) {}

  async registerDataset(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.datasetRegistry.registerDataset({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listDatasets(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.datasetRegistry.listDatasets();
    return createJsonResponse(context, result.value);
  }

  async getDataset(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const datasetId = this.requireDatasetId(context);
    const result = await this.datasetRegistry.getDataset(datasetId);
    if (!result.value) {
      throw new ApiValidationError({
        datasetId: [`Dataset not found: ${datasetId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateDataset(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const datasetId = this.requireDatasetId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.datasetRegistry.updateDataset({
      datasetId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeDataset(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const datasetId = this.requireDatasetId(context);
    const result = await this.datasetRegistry.deleteDataset(datasetId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.datasetRegistry.findDatasetByName(name);
    if (!result.value.dataset) {
      throw new ApiValidationError({ name: [`Dataset not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.datasetRegistry.listDatasetsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.datasetRegistry.getDatasetRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireDatasetId(context: ApiRequestContext): string {
    const datasetId = readString(context.params.datasetId);
    if (!datasetId) {
      throw new ApiValidationError({ datasetId: ["datasetId is required"] });
    }
    return datasetId;
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
