import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiTemplateRegistryApplicationService } from "@server/application/ai-template-registry/services/ai-template-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Template Registry HTTP controller — template management only. */
export class AiTemplateRegistryController {
  constructor(private readonly templateRegistry: AiTemplateRegistryApplicationService) {}

  async registerTemplate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.templateRegistry.registerTemplate({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listTemplates(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.templateRegistry.listTemplates();
    return createJsonResponse(context, result.value);
  }

  async getTemplate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const templateId = this.requireTemplateId(context);
    const result = await this.templateRegistry.getTemplate(templateId);
    if (!result.value) {
      throw new ApiValidationError({
        templateId: [`Template not found: ${templateId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateTemplate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const templateId = this.requireTemplateId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.templateRegistry.updateTemplate({
      templateId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeTemplate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const templateId = this.requireTemplateId(context);
    const result = await this.templateRegistry.deleteTemplate(templateId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.templateRegistry.findTemplateByName(name);
    if (!result.value.template) {
      throw new ApiValidationError({ name: [`Template not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.templateRegistry.listTemplatesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.templateRegistry.getTemplateRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireTemplateId(context: ApiRequestContext): string {
    const templateId = readString(context.params.templateId);
    if (!templateId) {
      throw new ApiValidationError({ templateId: ["templateId is required"] });
    }
    return templateId;
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
