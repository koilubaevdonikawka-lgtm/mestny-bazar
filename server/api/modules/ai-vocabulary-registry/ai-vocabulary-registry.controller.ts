import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiVocabularyRegistryApplicationService } from "@server/application/ai-vocabulary-registry/services/ai-vocabulary-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Vocabulary Registry HTTP controller — vocabulary management only. */
export class AiVocabularyRegistryController {
  constructor(
    private readonly vocabularyRegistry: AiVocabularyRegistryApplicationService,
  ) {}

  async registerVocabulary(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.vocabularyRegistry.registerVocabulary({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listVocabularies(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.vocabularyRegistry.listVocabularies();
    return createJsonResponse(context, result.value);
  }

  async getVocabulary(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const vocabularyId = this.requireVocabularyId(context);
    const result = await this.vocabularyRegistry.getVocabulary(vocabularyId);
    if (!result.value) {
      throw new ApiValidationError({
        vocabularyId: [`Vocabulary not found: ${vocabularyId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateVocabulary(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const vocabularyId = this.requireVocabularyId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.vocabularyRegistry.updateVocabulary({
      vocabularyId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeVocabulary(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const vocabularyId = this.requireVocabularyId(context);
    const result = await this.vocabularyRegistry.deleteVocabulary(vocabularyId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.vocabularyRegistry.findVocabularyByName(name);
    if (!result.value.vocabulary) {
      throw new ApiValidationError({ name: [`Vocabulary not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.vocabularyRegistry.listVocabulariesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.vocabularyRegistry.getVocabularyRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireVocabularyId(context: ApiRequestContext): string {
    const vocabularyId = readString(context.params.vocabularyId);
    if (!vocabularyId) {
      throw new ApiValidationError({ vocabularyId: ["vocabularyId is required"] });
    }
    return vocabularyId;
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
