import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiToolRegistryApplicationService } from "@server/application/ai-tool-registry/services/ai-tool-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Tool Registry HTTP controller — tool registration and lookup only. */
export class AiToolRegistryController {
  constructor(private readonly registry: AiToolRegistryApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const category = readString(body.category);
    const status = this.readStatus(body.status);

    const result = await this.registry.registerTool({
      name,
      description: description ?? undefined,
      category: category ?? undefined,
      schema: "schema" in body ? body.schema : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.registry.listTools();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const toolId = this.requireToolId(context);
    const result = await this.registry.getTool(toolId);
    if (!result.value) {
      throw new ApiValidationError({ toolId: [`Tool not found: ${toolId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async update(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const toolId = this.requireToolId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const description = readString(body.description);
    const category = readString(body.category);
    const status = this.readStatus(body.status);

    const result = await this.registry.updateTool({
      toolId,
      name: name ?? undefined,
      description: description ?? undefined,
      category: category ?? undefined,
      schema: "schema" in body ? body.schema : undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const toolId = this.requireToolId(context);
    const result = await this.registry.deleteTool(toolId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.registry.findToolByName(name);
    if (!result.value.tool) {
      throw new ApiValidationError({ name: [`Tool not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.registry.listToolsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.registry.getToolRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireToolId(context: ApiRequestContext): string {
    const toolId = readString(context.params.toolId);
    if (!toolId) {
      throw new ApiValidationError({ toolId: ["toolId is required"] });
    }
    return toolId;
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
