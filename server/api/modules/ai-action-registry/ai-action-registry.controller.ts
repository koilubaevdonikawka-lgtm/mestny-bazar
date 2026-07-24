import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiActionRegistryApplicationService } from "@server/application/ai-action-registry/services/ai-action-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Action Registry HTTP controller — action management only. */
export class AiActionRegistryController {
  constructor(private readonly actionRegistry: AiActionRegistryApplicationService) {}

  async registerAction(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.actionRegistry.registerAction({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listActions(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.actionRegistry.listActions();
    return createJsonResponse(context, result.value);
  }

  async getAction(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const actionId = this.requireActionId(context);
    const result = await this.actionRegistry.getAction(actionId);
    if (!result.value) {
      throw new ApiValidationError({
        actionId: [`Action not found: ${actionId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateAction(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const actionId = this.requireActionId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.actionRegistry.updateAction({
      actionId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeAction(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const actionId = this.requireActionId(context);
    const result = await this.actionRegistry.deleteAction(actionId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.actionRegistry.findActionByName(name);
    if (!result.value.action) {
      throw new ApiValidationError({ name: [`Action not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.actionRegistry.listActionsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.actionRegistry.getActionRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireActionId(context: ApiRequestContext): string {
    const actionId = readString(context.params.actionId);
    if (!actionId) {
      throw new ApiValidationError({ actionId: ["actionId is required"] });
    }
    return actionId;
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
