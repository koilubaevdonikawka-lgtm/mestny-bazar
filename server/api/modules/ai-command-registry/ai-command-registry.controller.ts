import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiCommandRegistryApplicationService } from "@server/application/ai-command-registry/services/ai-command-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Command Registry HTTP controller — command management only. */
export class AiCommandRegistryController {
  constructor(private readonly commandRegistry: AiCommandRegistryApplicationService) {}

  async registerCommand(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.commandRegistry.registerCommand({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listCommands(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.commandRegistry.listCommands();
    return createJsonResponse(context, result.value);
  }

  async getCommand(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const commandId = this.requireCommandId(context);
    const result = await this.commandRegistry.getCommand(commandId);
    if (!result.value) {
      throw new ApiValidationError({
        commandId: [`Command not found: ${commandId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateCommand(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const commandId = this.requireCommandId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.commandRegistry.updateCommand({
      commandId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeCommand(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const commandId = this.requireCommandId(context);
    const result = await this.commandRegistry.deleteCommand(commandId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.commandRegistry.findCommandByName(name);
    if (!result.value.command) {
      throw new ApiValidationError({ name: [`Command not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.commandRegistry.listCommandsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.commandRegistry.getCommandRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireCommandId(context: ApiRequestContext): string {
    const commandId = readString(context.params.commandId);
    if (!commandId) {
      throw new ApiValidationError({ commandId: ["commandId is required"] });
    }
    return commandId;
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
