import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiAgentSandboxApplicationService } from "@server/application/ai-agent-sandbox/services/ai-agent-sandbox-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Agent Sandbox HTTP controller — sandbox registration and mock session management only. */
export class AiAgentSandboxController {
  constructor(private readonly sandbox: AiAgentSandboxApplicationService) {}

  async registerSandbox(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);
    const isolationLevel = this.readIsolationLevel(body.isolationLevel);

    const result = await this.sandbox.registerSandbox({
      name,
      description: description ?? undefined,
      isolationLevel,
      config: "config" in body ? body.config : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSandboxes(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.sandbox.listSandboxes();
    return createJsonResponse(context, result.value);
  }

  async getSandbox(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sandboxId = this.requireSandboxId(context);
    const result = await this.sandbox.getSandbox(sandboxId);
    if (!result.value) {
      throw new ApiValidationError({ sandboxId: [`Sandbox not found: ${sandboxId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async updateSandbox(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sandboxId = this.requireSandboxId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const description = readString(body.description);
    const status = this.readStatus(body.status);
    const isolationLevel = this.readIsolationLevel(body.isolationLevel);

    const result = await this.sandbox.updateSandbox({
      sandboxId,
      name: name ?? undefined,
      description: description ?? undefined,
      isolationLevel,
      config: "config" in body ? body.config : undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeSandbox(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sandboxId = this.requireSandboxId(context);
    const result = await this.sandbox.deleteSandbox(sandboxId);
    return createJsonResponse(context, result.value);
  }

  async createSession(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const sandboxId = readString(body.sandboxId);
    const name = readString(body.name);

    if (!sandboxId) {
      throw new ApiValidationError({ sandboxId: ["sandboxId is required"] });
    }
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const result = await this.sandbox.createSandboxSession({
      sandboxId,
      name,
      config: "config" in body ? body.config : undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSessions(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.sandbox.listSandboxSessions();
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.sandbox.getSandboxStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireSandboxId(context: ApiRequestContext): string {
    const sandboxId = readString(context.params.sandboxId);
    if (!sandboxId) {
      throw new ApiValidationError({ sandboxId: ["sandboxId is required"] });
    }
    return sandboxId;
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

  private readIsolationLevel(
    value: unknown,
  ): "strict" | "standard" | "relaxed" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "strict" || value === "standard" || value === "relaxed") {
      return value;
    }
    throw new ApiValidationError({
      isolationLevel: ["isolationLevel must be 'strict', 'standard', or 'relaxed'"],
    });
  }
}
