import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiEntityRegistryApplicationService } from "@server/application/ai-entity-registry/services/ai-entity-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Entity Registry HTTP controller — entity management only. */
export class AiEntityRegistryController {
  constructor(
    private readonly entityRegistry: AiEntityRegistryApplicationService,
  ) {}

  async registerEntity(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.entityRegistry.registerEntity({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listEntities(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.entityRegistry.listEntities();
    return createJsonResponse(context, result.value);
  }

  async getEntity(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const entityId = this.requireEntityId(context);
    const result = await this.entityRegistry.getEntity(entityId);
    if (!result.value) {
      throw new ApiValidationError({
        entityId: [`Entity not found: ${entityId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateEntity(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const entityId = this.requireEntityId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.entityRegistry.updateEntity({
      entityId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeEntity(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const entityId = this.requireEntityId(context);
    const result = await this.entityRegistry.deleteEntity(entityId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.entityRegistry.findEntityByName(name);
    if (!result.value.entity) {
      throw new ApiValidationError({ name: [`Entity not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.entityRegistry.listEntitiesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.entityRegistry.getEntityRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireEntityId(context: ApiRequestContext): string {
    const entityId = readString(context.params.entityId);
    if (!entityId) {
      throw new ApiValidationError({ entityId: ["entityId is required"] });
    }
    return entityId;
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
