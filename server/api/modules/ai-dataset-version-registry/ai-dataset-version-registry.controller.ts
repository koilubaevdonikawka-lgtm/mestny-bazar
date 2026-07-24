import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiDatasetVersionRegistryApplicationService } from "@server/application/ai-dataset-version-registry/services/ai-dataset-version-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Dataset Version Registry HTTP controller — dataset version management only. */
export class AiDatasetVersionRegistryController {
  constructor(
    private readonly datasetVersionRegistry: AiDatasetVersionRegistryApplicationService,
  ) {}

  async registerDatasetVersion(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.datasetVersionRegistry.registerDatasetVersion({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listDatasetVersions(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.datasetVersionRegistry.listDatasetVersions();
    return createJsonResponse(context, result.value);
  }

  async getDatasetVersion(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const datasetVersionId = this.requireDatasetVersionId(context);
    const result = await this.datasetVersionRegistry.getDatasetVersion(datasetVersionId);
    if (!result.value) {
      throw new ApiValidationError({
        datasetVersionId: [`Dataset version not found: ${datasetVersionId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateDatasetVersion(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const datasetVersionId = this.requireDatasetVersionId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.datasetVersionRegistry.updateDatasetVersion({
      datasetVersionId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeDatasetVersion(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const datasetVersionId = this.requireDatasetVersionId(context);
    const result = await this.datasetVersionRegistry.deleteDatasetVersion(datasetVersionId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.datasetVersionRegistry.findDatasetVersionByName(name);
    if (!result.value.datasetVersion) {
      throw new ApiValidationError({ name: [`Dataset version not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.datasetVersionRegistry.listDatasetVersionsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.datasetVersionRegistry.getDatasetVersionRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireDatasetVersionId(context: ApiRequestContext): string {
    const datasetVersionId = readString(context.params.datasetVersionId);
    if (!datasetVersionId) {
      throw new ApiValidationError({ datasetVersionId: ["datasetVersionId is required"] });
    }
    return datasetVersionId;
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
