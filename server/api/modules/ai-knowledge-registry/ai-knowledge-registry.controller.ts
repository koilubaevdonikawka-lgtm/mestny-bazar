import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiKnowledgeRegistryApplicationService } from "@server/application/ai-knowledge-registry/services/ai-knowledge-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Knowledge Registry HTTP controller — knowledge source registry management only. */
export class AiKnowledgeRegistryController {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryApplicationService) {}

  async registerSource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.knowledgeRegistry.registerKnowledgeSource({
      name,
      category,
      description: description ?? undefined,
      data: "data" in body ? body.data : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSources(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.knowledgeRegistry.listKnowledgeSources();
    return createJsonResponse(context, result.value);
  }

  async getSource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeId = this.requireKnowledgeId(context);
    const result = await this.knowledgeRegistry.getKnowledgeSource(knowledgeId);
    if (!result.value) {
      throw new ApiValidationError({
        knowledgeId: [`Knowledge source not found: ${knowledgeId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateSource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeId = this.requireKnowledgeId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.knowledgeRegistry.updateKnowledgeSource({
      knowledgeId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      data: "data" in body ? body.data : undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeSource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeId = this.requireKnowledgeId(context);
    const result = await this.knowledgeRegistry.deleteKnowledgeSource(knowledgeId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.knowledgeRegistry.findKnowledgeSourceByName(name);
    if (!result.value.source) {
      throw new ApiValidationError({
        name: [`Knowledge source not found: ${name}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.knowledgeRegistry.listKnowledgeSourcesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.knowledgeRegistry.getKnowledgeRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireKnowledgeId(context: ApiRequestContext): string {
    const knowledgeId = readString(context.params.knowledgeId);
    if (!knowledgeId) {
      throw new ApiValidationError({ knowledgeId: ["knowledgeId is required"] });
    }
    return knowledgeId;
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
