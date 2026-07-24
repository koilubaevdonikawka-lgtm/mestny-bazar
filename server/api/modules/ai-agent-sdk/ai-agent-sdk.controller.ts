import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiAgentSdkApplicationService } from "@server/application/ai-agent-sdk/services/ai-agent-sdk-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Agent SDK HTTP controller — SDK registration and mock instance management only. */
export class AiAgentSdkController {
  constructor(private readonly agentSdk: AiAgentSdkApplicationService) {}

  async registerSdk(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const version = readString(body.version);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!version) {
      throw new ApiValidationError({ version: ["version is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);
    const capabilities = this.readStringArray(body.capabilities);

    const result = await this.agentSdk.registerAgentSdk({
      name,
      version,
      description: description ?? undefined,
      capabilities,
      config: "config" in body ? body.config : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSdks(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.agentSdk.listAgentSdks();
    return createJsonResponse(context, result.value);
  }

  async getSdk(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sdkId = this.requireSdkId(context);
    const result = await this.agentSdk.getAgentSdk(sdkId);
    if (!result.value) {
      throw new ApiValidationError({ sdkId: [`Agent SDK not found: ${sdkId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async updateSdk(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sdkId = this.requireSdkId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const version = readString(body.version);
    const description = readString(body.description);
    const status = this.readStatus(body.status);
    const capabilities = this.readStringArray(body.capabilities);

    const result = await this.agentSdk.updateAgentSdk({
      sdkId,
      name: name ?? undefined,
      version: version ?? undefined,
      description: description ?? undefined,
      capabilities,
      config: "config" in body ? body.config : undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeSdk(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sdkId = this.requireSdkId(context);
    const result = await this.agentSdk.deleteAgentSdk(sdkId);
    return createJsonResponse(context, result.value);
  }

  async createInstance(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const sdkId = readString(body.sdkId);
    const name = readString(body.name);

    if (!sdkId) {
      throw new ApiValidationError({ sdkId: ["sdkId is required"] });
    }
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const result = await this.agentSdk.createAgentInstance({
      sdkId,
      name,
      config: "config" in body ? body.config : undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listInstances(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.agentSdk.listAgentInstances();
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.agentSdk.getAgentSdkStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireSdkId(context: ApiRequestContext): string {
    const sdkId = readString(context.params.sdkId);
    if (!sdkId) {
      throw new ApiValidationError({ sdkId: ["sdkId is required"] });
    }
    return sdkId;
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

  private readStringArray(value: unknown): readonly string[] | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (!Array.isArray(value)) {
      throw new ApiValidationError({ capabilities: ["capabilities must be an array of strings"] });
    }
    return Object.freeze(
      value.filter((item): item is string => typeof item === "string").map((item) => item.trim()),
    );
  }
}
