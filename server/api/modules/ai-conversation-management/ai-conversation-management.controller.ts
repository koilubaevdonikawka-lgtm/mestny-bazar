import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiConversationManagementApplicationService } from "@server/application/ai-conversation-management/services/ai-conversation-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Conversation Management HTTP controller — conversation management only. */
export class AiConversationManagementController {
  constructor(
    private readonly conversationManagement: AiConversationManagementApplicationService,
  ) {}

  async createConversation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.conversationManagement.createConversation({
      name,
      description: description ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listConversations(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.conversationManagement.listConversations();
    return createJsonResponse(context, result.value);
  }

  async getConversation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const conversationId = this.requireConversationId(context);
    const result = await this.conversationManagement.getConversation(conversationId);
    if (!result.value) {
      throw new ApiValidationError({
        conversationId: [`Conversation not found: ${conversationId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateConversation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const conversationId = this.requireConversationId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.conversationManagement.updateConversation({
      conversationId,
      name: name ?? undefined,
      description: description ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async closeConversation(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const conversationId = this.requireConversationId(context);
    const result = await this.conversationManagement.closeConversation(conversationId);
    if (!result.value.closed) {
      throw new ApiValidationError({
        conversationId: [`Conversation not found: ${conversationId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.conversationManagement.findConversationByName(name);
    if (!result.value.conversation) {
      throw new ApiValidationError({ name: [`Conversation not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByStatus(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const status = readString(context.params.status);
    if (!status) {
      throw new ApiValidationError({ status: ["status is required"] });
    }
    const result = await this.conversationManagement.listConversationsByStatus(status);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.conversationManagement.getConversationStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireConversationId(context: ApiRequestContext): string {
    const conversationId = readString(context.params.conversationId);
    if (!conversationId) {
      throw new ApiValidationError({ conversationId: ["conversationId is required"] });
    }
    return conversationId;
  }

  private readStatus(value: unknown): "active" | "closed" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "closed") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'closed'"] });
  }
}
