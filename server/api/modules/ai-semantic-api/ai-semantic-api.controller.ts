import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiSemanticApiApplicationService } from "@server/application/ai-semantic-api/services/ai-semantic-api-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Semantic API HTTP controller — semantic endpoint management and mock request handling only. */
export class AiSemanticApiController {
  constructor(private readonly semanticApi: AiSemanticApiApplicationService) {}

  async registerEndpoint(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const path = readString(body.path);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!path) {
      throw new ApiValidationError({ path: ["path is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.semanticApi.registerSemanticEndpoint({
      name,
      path,
      description: description ?? undefined,
      schema: "schema" in body ? body.schema : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listEndpoints(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.semanticApi.listSemanticEndpoints();
    return createJsonResponse(context, result.value);
  }

  async getEndpoint(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const endpointId = this.requireEndpointId(context);
    const result = await this.semanticApi.getSemanticEndpoint(endpointId);
    if (!result.value) {
      throw new ApiValidationError({
        endpointId: [`Semantic endpoint not found: ${endpointId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateEndpoint(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const endpointId = this.requireEndpointId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const path = readString(body.path);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.semanticApi.updateSemanticEndpoint({
      endpointId,
      name: name ?? undefined,
      path: path ?? undefined,
      description: description ?? undefined,
      schema: "schema" in body ? body.schema : undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeEndpoint(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const endpointId = this.requireEndpointId(context);
    const result = await this.semanticApi.deleteSemanticEndpoint(endpointId);
    return createJsonResponse(context, result.value);
  }

  async handleRequest(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const endpointId = readString(body.endpointId);
    const intent = readString(body.intent);

    if (!endpointId && !intent) {
      throw new ApiValidationError({
        endpointId: ["Either endpointId or intent is required"],
        intent: ["Either endpointId or intent is required"],
      });
    }

    const result = await this.semanticApi.handleSemanticRequest({
      endpointId: endpointId ?? undefined,
      intent: intent ?? undefined,
      payload: "payload" in body ? body.payload : undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.semanticApi.getSemanticRequestHistory();
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.semanticApi.getSemanticApiStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireEndpointId(context: ApiRequestContext): string {
    const endpointId = readString(context.params.endpointId);
    if (!endpointId) {
      throw new ApiValidationError({ endpointId: ["endpointId is required"] });
    }
    return endpointId;
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
