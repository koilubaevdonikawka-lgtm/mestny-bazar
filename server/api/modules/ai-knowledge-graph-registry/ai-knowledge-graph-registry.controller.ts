import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiKnowledgeGraphRegistryApplicationService } from "@server/application/ai-knowledge-graph-registry/services/ai-knowledge-graph-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Knowledge Graph Registry HTTP controller — knowledge graph management only. */
export class AiKnowledgeGraphRegistryController {
  constructor(
    private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryApplicationService,
  ) {}

  async registerKnowledgeGraph(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.knowledgeGraphRegistry.registerKnowledgeGraph({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listKnowledgeGraphs(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.knowledgeGraphRegistry.listKnowledgeGraphs();
    return createJsonResponse(context, result.value);
  }

  async getKnowledgeGraph(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeGraphId = this.requireKnowledgeGraphId(context);
    const result = await this.knowledgeGraphRegistry.getKnowledgeGraph(knowledgeGraphId);
    if (!result.value) {
      throw new ApiValidationError({
        knowledgeGraphId: [`Knowledge graph not found: ${knowledgeGraphId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateKnowledgeGraph(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeGraphId = this.requireKnowledgeGraphId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.knowledgeGraphRegistry.updateKnowledgeGraph({
      knowledgeGraphId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeKnowledgeGraph(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeGraphId = this.requireKnowledgeGraphId(context);
    const result = await this.knowledgeGraphRegistry.deleteKnowledgeGraph(knowledgeGraphId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.knowledgeGraphRegistry.findKnowledgeGraphByName(name);
    if (!result.value.knowledgeGraph) {
      throw new ApiValidationError({ name: [`Knowledge graph not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.knowledgeGraphRegistry.listKnowledgeGraphsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.knowledgeGraphRegistry.getKnowledgeGraphRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireKnowledgeGraphId(context: ApiRequestContext): string {
    const knowledgeGraphId = readString(context.params.knowledgeGraphId);
    if (!knowledgeGraphId) {
      throw new ApiValidationError({ knowledgeGraphId: ["knowledgeGraphId is required"] });
    }
    return knowledgeGraphId;
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
