import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiKnowledgePackageRegistryApplicationService } from "@server/application/ai-knowledge-package-registry/services/ai-knowledge-package-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Knowledge Package Registry HTTP controller — knowledge package management only. */
export class AiKnowledgePackageRegistryController {
  constructor(
    private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryApplicationService,
  ) {}

  async registerKnowledgePackage(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.knowledgePackageRegistry.registerKnowledgePackage({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listKnowledgePackages(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.knowledgePackageRegistry.listKnowledgePackages();
    return createJsonResponse(context, result.value);
  }

  async getKnowledgePackage(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgePackageId = this.requireKnowledgePackageId(context);
    const result = await this.knowledgePackageRegistry.getKnowledgePackage(knowledgePackageId);
    if (!result.value) {
      throw new ApiValidationError({
        knowledgePackageId: [`Knowledge package not found: ${knowledgePackageId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateKnowledgePackage(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgePackageId = this.requireKnowledgePackageId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.knowledgePackageRegistry.updateKnowledgePackage({
      knowledgePackageId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeKnowledgePackage(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const knowledgePackageId = this.requireKnowledgePackageId(context);
    const result = await this.knowledgePackageRegistry.deleteKnowledgePackage(knowledgePackageId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.knowledgePackageRegistry.findKnowledgePackageByName(name);
    if (!result.value.knowledgePackage) {
      throw new ApiValidationError({ name: [`Knowledge package not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.knowledgePackageRegistry.listKnowledgePackagesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.knowledgePackageRegistry.getKnowledgePackageRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireKnowledgePackageId(context: ApiRequestContext): string {
    const knowledgePackageId = readString(context.params.knowledgePackageId);
    if (!knowledgePackageId) {
      throw new ApiValidationError({ knowledgePackageId: ["knowledgePackageId is required"] });
    }
    return knowledgePackageId;
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
