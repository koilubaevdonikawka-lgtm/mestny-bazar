import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiAgentGatewayApplicationService } from "@server/application/ai-agent-gateway/services/ai-agent-gateway-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Agent Gateway HTTP controller — agent routing and execution only. */
export class AiAgentGatewayController {
  constructor(private readonly gateway: AiAgentGatewayApplicationService) {}

  async registerAgent(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const providerType = readString(body.providerType);
    const status = this.readStatus(body.status);

    const result = await this.gateway.registerAgent({
      name,
      description: description ?? undefined,
      providerType: providerType ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listAgents(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.gateway.listAgents();
    return createJsonResponse(context, result.value);
  }

  async getAgent(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const agentId = this.requireAgentId(context);
    const result = await this.gateway.getAgent(agentId);
    if (!result.value) {
      throw new ApiValidationError({ agentId: [`Agent not found: ${agentId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async registerRoute(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const routeKey = readString(body.routeKey);
    const agentId = readString(body.agentId);

    if (!routeKey) {
      throw new ApiValidationError({ routeKey: ["routeKey is required"] });
    }
    if (!agentId) {
      throw new ApiValidationError({ agentId: ["agentId is required"] });
    }

    const result = await this.gateway.registerAgentRoute({ routeKey, agentId });
    return createJsonResponse(context, result.value, 201);
  }

  async execute(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const agentId = readString(body.agentId);
    const routeKey = readString(body.routeKey);
    const prompt = readString(body.prompt);

    if (!agentId && !routeKey) {
      throw new ApiValidationError({
        agentId: ["Either agentId or routeKey is required"],
        routeKey: ["Either agentId or routeKey is required"],
      });
    }

    const result = await this.gateway.executeAgentRequest({
      agentId: agentId ?? undefined,
      routeKey: routeKey ?? undefined,
      prompt: prompt ?? undefined,
      payload: "payload" in body ? body.payload : undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.gateway.getAgentRequestHistory();
    return createJsonResponse(context, result.value);
  }

  async clearHistory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.gateway.clearAgentRequestHistory();
    return createJsonResponse(context, result.value);
  }

  private requireAgentId(context: ApiRequestContext): string {
    const agentId = readString(context.params.agentId);
    if (!agentId) {
      throw new ApiValidationError({ agentId: ["agentId is required"] });
    }
    return agentId;
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
