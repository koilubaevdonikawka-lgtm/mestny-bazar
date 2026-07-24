import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiPromptRegistryApplicationService } from "@server/application/ai-prompt-registry/services/ai-prompt-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Prompt Registry HTTP controller — prompt management only. */
export class AiPromptRegistryController {
  constructor(private readonly promptRegistry: AiPromptRegistryApplicationService) {}

  async registerPrompt(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const content = readString(body.content);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    if (!content) {
      throw new ApiValidationError({ content: ["content is required"] });
    }

    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.promptRegistry.registerPrompt({
      name,
      category,
      content,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listPrompts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.promptRegistry.listPrompts();
    return createJsonResponse(context, result.value);
  }

  async getPrompt(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const promptId = this.requirePromptId(context);
    const result = await this.promptRegistry.getPrompt(promptId);
    if (!result.value) {
      throw new ApiValidationError({
        promptId: [`Prompt not found: ${promptId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updatePrompt(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const promptId = this.requirePromptId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const content = readString(body.content);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.promptRegistry.updatePrompt({
      promptId,
      name: name ?? undefined,
      category: category ?? undefined,
      content: content ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removePrompt(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const promptId = this.requirePromptId(context);
    const result = await this.promptRegistry.deletePrompt(promptId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.promptRegistry.findPromptByName(name);
    if (!result.value.prompt) {
      throw new ApiValidationError({ name: [`Prompt not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.promptRegistry.listPromptsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.promptRegistry.getPromptRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requirePromptId(context: ApiRequestContext): string {
    const promptId = readString(context.params.promptId);
    if (!promptId) {
      throw new ApiValidationError({ promptId: ["promptId is required"] });
    }
    return promptId;
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
