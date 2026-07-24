import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiCatalogMetadataApplicationService } from "@server/application/ai-catalog-metadata/services/ai-catalog-metadata-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Catalog Metadata HTTP controller — metadata registry management only. */
export class AiCatalogMetadataController {
  constructor(private readonly catalogMetadata: AiCatalogMetadataApplicationService) {}

  async registerMetadata(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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
    const status = this.readStatus(body.status);

    const result = await this.catalogMetadata.registerCatalogMetadata({
      name,
      category,
      description: description ?? undefined,
      data: "data" in body ? body.data : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listMetadata(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.catalogMetadata.listCatalogMetadata();
    return createJsonResponse(context, result.value);
  }

  async getMetadata(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const metadataId = this.requireMetadataId(context);
    const result = await this.catalogMetadata.getCatalogMetadata(metadataId);
    if (!result.value) {
      throw new ApiValidationError({
        metadataId: [`Catalog metadata not found: ${metadataId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateMetadata(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const metadataId = this.requireMetadataId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.catalogMetadata.updateCatalogMetadata({
      metadataId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      data: "data" in body ? body.data : undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeMetadata(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const metadataId = this.requireMetadataId(context);
    const result = await this.catalogMetadata.deleteCatalogMetadata(metadataId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.catalogMetadata.findCatalogMetadataByName(name);
    if (!result.value.entry) {
      throw new ApiValidationError({
        name: [`Catalog metadata not found: ${name}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.catalogMetadata.listCatalogMetadataByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.catalogMetadata.getCatalogMetadataStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireMetadataId(context: ApiRequestContext): string {
    const metadataId = readString(context.params.metadataId);
    if (!metadataId) {
      throw new ApiValidationError({ metadataId: ["metadataId is required"] });
    }
    return metadataId;
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
