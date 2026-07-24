import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiRelationRegistryApplicationService } from "@server/application/ai-relation-registry/services/ai-relation-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Relation Registry HTTP controller — relation management only. */
export class AiRelationRegistryController {
  constructor(
    private readonly relationRegistry: AiRelationRegistryApplicationService,
  ) {}

  async registerRelation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.relationRegistry.registerRelation({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listRelations(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.relationRegistry.listRelations();
    return createJsonResponse(context, result.value);
  }

  async getRelation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const relationId = this.requireRelationId(context);
    const result = await this.relationRegistry.getRelation(relationId);
    if (!result.value) {
      throw new ApiValidationError({
        relationId: [`Relation not found: ${relationId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateRelation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const relationId = this.requireRelationId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.relationRegistry.updateRelation({
      relationId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeRelation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const relationId = this.requireRelationId(context);
    const result = await this.relationRegistry.deleteRelation(relationId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.relationRegistry.findRelationByName(name);
    if (!result.value.relation) {
      throw new ApiValidationError({ name: [`Relation not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.relationRegistry.listRelationsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.relationRegistry.getRelationRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireRelationId(context: ApiRequestContext): string {
    const relationId = readString(context.params.relationId);
    if (!relationId) {
      throw new ApiValidationError({ relationId: ["relationId is required"] });
    }
    return relationId;
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
