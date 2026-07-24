import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiContextManagementApplicationService } from "@server/application/ai-context-management/services/ai-context-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Context Management HTTP controller — context management only. */
export class AiContextManagementController {
  constructor(private readonly contextManagement: AiContextManagementApplicationService) {}

  async createContext(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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
    const status = this.readStatus(body.status);

    const result = await this.contextManagement.createContext({
      name,
      category,
      content,
      description: description ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listContexts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.contextManagement.listContexts();
    return createJsonResponse(context, result.value);
  }

  async getContext(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const contextId = this.requireContextId(context);
    const result = await this.contextManagement.getContext(contextId);
    if (!result.value) {
      throw new ApiValidationError({
        contextId: [`Context not found: ${contextId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateContext(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const contextId = this.requireContextId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const content = readString(body.content);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.contextManagement.updateContext({
      contextId,
      name: name ?? undefined,
      category: category ?? undefined,
      content: content ?? undefined,
      description: description ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeContext(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const contextId = this.requireContextId(context);
    const result = await this.contextManagement.deleteContext(contextId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.contextManagement.findContextByName(name);
    if (!result.value.context) {
      throw new ApiValidationError({ name: [`Context not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.contextManagement.listContextsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.contextManagement.getContextStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireContextId(context: ApiRequestContext): string {
    const contextId = readString(context.params.contextId);
    if (!contextId) {
      throw new ApiValidationError({ contextId: ["contextId is required"] });
    }
    return contextId;
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
