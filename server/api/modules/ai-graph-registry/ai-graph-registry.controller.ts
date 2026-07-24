import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiGraphRegistryApplicationService } from "@server/application/ai-graph-registry/services/ai-graph-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Graph Registry HTTP controller — graph management only. */
export class AiGraphRegistryController {
  constructor(
    private readonly graphRegistry: AiGraphRegistryApplicationService,
  ) {}

  async registerGraph(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.graphRegistry.registerGraph({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listGraphs(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.graphRegistry.listGraphs();
    return createJsonResponse(context, result.value);
  }

  async getGraph(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const graphId = this.requireGraphId(context);
    const result = await this.graphRegistry.getGraph(graphId);
    if (!result.value) {
      throw new ApiValidationError({
        graphId: [`Graph not found: ${graphId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateGraph(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const graphId = this.requireGraphId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.graphRegistry.updateGraph({
      graphId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeGraph(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const graphId = this.requireGraphId(context);
    const result = await this.graphRegistry.deleteGraph(graphId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.graphRegistry.findGraphByName(name);
    if (!result.value.graph) {
      throw new ApiValidationError({ name: [`Graph not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.graphRegistry.listGraphsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.graphRegistry.getGraphRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireGraphId(context: ApiRequestContext): string {
    const graphId = readString(context.params.graphId);
    if (!graphId) {
      throw new ApiValidationError({ graphId: ["graphId is required"] });
    }
    return graphId;
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
