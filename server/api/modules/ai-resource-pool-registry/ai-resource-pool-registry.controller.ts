import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiResourcePoolRegistryApplicationService } from "@server/application/ai-resource-pool-registry/services/ai-resource-pool-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Resource Pool Registry HTTP controller — resource pool management only. */
export class AiResourcePoolRegistryController {
  constructor(
    private readonly resourcePoolRegistry: AiResourcePoolRegistryApplicationService,
  ) {}

  async registerResourcePool(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.resourcePoolRegistry.registerResourcePool({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listResourcePools(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.resourcePoolRegistry.listResourcePools();
    return createJsonResponse(context, result.value);
  }

  async getResourcePool(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourcePoolId = this.requireResourcePoolId(context);
    const result = await this.resourcePoolRegistry.getResourcePool(resourcePoolId);
    if (!result.value) {
      throw new ApiValidationError({
        resourcePoolId: [`Resource pool not found: ${resourcePoolId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateResourcePool(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourcePoolId = this.requireResourcePoolId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.resourcePoolRegistry.updateResourcePool({
      resourcePoolId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeResourcePool(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourcePoolId = this.requireResourcePoolId(context);
    const result = await this.resourcePoolRegistry.deleteResourcePool(resourcePoolId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.resourcePoolRegistry.findResourcePoolByName(name);
    if (!result.value.resourcePool) {
      throw new ApiValidationError({ name: [`Resource pool not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.resourcePoolRegistry.listResourcePoolsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.resourcePoolRegistry.getResourcePoolRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireResourcePoolId(context: ApiRequestContext): string {
    const resourcePoolId = readString(context.params.resourcePoolId);
    if (!resourcePoolId) {
      throw new ApiValidationError({ resourcePoolId: ["resourcePoolId is required"] });
    }
    return resourcePoolId;
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
