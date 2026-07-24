import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiSchemaRegistryApplicationService } from "@server/application/ai-schema-registry/services/ai-schema-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Schema Registry HTTP controller — schema management only. */
export class AiSchemaRegistryController {
  constructor(
    private readonly schemaRegistry: AiSchemaRegistryApplicationService,
  ) {}

  async registerSchema(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.schemaRegistry.registerSchema({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSchemas(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.schemaRegistry.listSchemas();
    return createJsonResponse(context, result.value);
  }

  async getSchema(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const schemaId = this.requireSchemaId(context);
    const result = await this.schemaRegistry.getSchema(schemaId);
    if (!result.value) {
      throw new ApiValidationError({
        schemaId: [`Schema not found: ${schemaId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateSchema(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const schemaId = this.requireSchemaId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.schemaRegistry.updateSchema({
      schemaId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeSchema(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const schemaId = this.requireSchemaId(context);
    const result = await this.schemaRegistry.deleteSchema(schemaId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.schemaRegistry.findSchemaByName(name);
    if (!result.value.schema) {
      throw new ApiValidationError({ name: [`Schema not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.schemaRegistry.listSchemasByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.schemaRegistry.getSchemaRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireSchemaId(context: ApiRequestContext): string {
    const schemaId = readString(context.params.schemaId);
    if (!schemaId) {
      throw new ApiValidationError({ schemaId: ["schemaId is required"] });
    }
    return schemaId;
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
