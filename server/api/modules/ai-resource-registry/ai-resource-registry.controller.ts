import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiResourceRegistryApplicationService } from "@server/application/ai-resource-registry/services/ai-resource-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Resource Registry HTTP controller — resource management only. */
export class AiResourceRegistryController {
  constructor(private readonly resourceRegistry: AiResourceRegistryApplicationService) {}

  async registerResource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const type = readString(body.type);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.resourceRegistry.registerResource({
      name,
      type,
      description: description ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listResources(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.resourceRegistry.listResources();
    return createJsonResponse(context, result.value);
  }

  async getResource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourceId = this.requireResourceId(context);
    const result = await this.resourceRegistry.getResource(resourceId);
    if (!result.value) {
      throw new ApiValidationError({
        resourceId: [`Resource not found: ${resourceId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateResource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourceId = this.requireResourceId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const type = readString(body.type);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.resourceRegistry.updateResource({
      resourceId,
      name: name ?? undefined,
      type: type ?? undefined,
      description: description ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeResource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourceId = this.requireResourceId(context);
    const result = await this.resourceRegistry.deleteResource(resourceId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.resourceRegistry.findResourceByName(name);
    if (!result.value.resource) {
      throw new ApiValidationError({ name: [`Resource not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByType(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const type = readString(context.params.type);
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }
    const result = await this.resourceRegistry.listResourcesByType(type);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.resourceRegistry.getResourceRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireResourceId(context: ApiRequestContext): string {
    const resourceId = readString(context.params.resourceId);
    if (!resourceId) {
      throw new ApiValidationError({ resourceId: ["resourceId is required"] });
    }
    return resourceId;
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
