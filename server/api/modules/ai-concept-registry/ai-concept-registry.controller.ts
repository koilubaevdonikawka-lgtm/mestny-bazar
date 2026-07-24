import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiConceptRegistryApplicationService } from "@server/application/ai-concept-registry/services/ai-concept-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Concept Registry HTTP controller — concept management only. */
export class AiConceptRegistryController {
  constructor(
    private readonly conceptRegistry: AiConceptRegistryApplicationService,
  ) {}

  async registerConcept(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.conceptRegistry.registerConcept({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listConcepts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.conceptRegistry.listConcepts();
    return createJsonResponse(context, result.value);
  }

  async getConcept(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const conceptId = this.requireConceptId(context);
    const result = await this.conceptRegistry.getConcept(conceptId);
    if (!result.value) {
      throw new ApiValidationError({
        conceptId: [`Concept not found: ${conceptId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateConcept(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const conceptId = this.requireConceptId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.conceptRegistry.updateConcept({
      conceptId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeConcept(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const conceptId = this.requireConceptId(context);
    const result = await this.conceptRegistry.deleteConcept(conceptId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.conceptRegistry.findConceptByName(name);
    if (!result.value.concept) {
      throw new ApiValidationError({ name: [`Concept not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.conceptRegistry.listConceptsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.conceptRegistry.getConceptRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireConceptId(context: ApiRequestContext): string {
    const conceptId = readString(context.params.conceptId);
    if (!conceptId) {
      throw new ApiValidationError({ conceptId: ["conceptId is required"] });
    }
    return conceptId;
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
