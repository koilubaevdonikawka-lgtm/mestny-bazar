import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiKnowledgeSourceRegistryApplicationService } from "@server/application/ai-knowledge-source-registry/services/ai-knowledge-source-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Knowledge Source Registry HTTP controller — knowledge source management only. */
export class AiKnowledgeSourceRegistryController {
  constructor(
    private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryApplicationService,
  ) {}

  async registerKnowledgeSource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.knowledgeSourceRegistry.registerKnowledgeSource({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listKnowledgeSources(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.knowledgeSourceRegistry.listKnowledgeSources();
    return createJsonResponse(context, result.value);
  }

  async getKnowledgeSource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeSourceId = this.requireKnowledgeSourceId(context);
    const result = await this.knowledgeSourceRegistry.getKnowledgeSource(knowledgeSourceId);
    if (!result.value) {
      throw new ApiValidationError({
        knowledgeSourceId: [`Knowledge source not found: ${knowledgeSourceId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateKnowledgeSource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeSourceId = this.requireKnowledgeSourceId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.knowledgeSourceRegistry.updateKnowledgeSource({
      knowledgeSourceId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeKnowledgeSource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgeSourceId = this.requireKnowledgeSourceId(context);
    const result = await this.knowledgeSourceRegistry.deleteKnowledgeSource(knowledgeSourceId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.knowledgeSourceRegistry.findKnowledgeSourceByName(name);
    if (!result.value.knowledgeSource) {
      throw new ApiValidationError({ name: [`Knowledge source not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.knowledgeSourceRegistry.listKnowledgeSourcesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.knowledgeSourceRegistry.getKnowledgeSourceRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireKnowledgeSourceId(context: ApiRequestContext): string {
    const knowledgeSourceId = readString(context.params.knowledgeSourceId);
    if (!knowledgeSourceId) {
      throw new ApiValidationError({ knowledgeSourceId: ["knowledgeSourceId is required"] });
    }
    return knowledgeSourceId;
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
