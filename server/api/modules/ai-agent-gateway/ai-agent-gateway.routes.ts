import type { AiAgentGatewayController } from "@server/api/modules/ai-agent-gateway/ai-agent-gateway.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiAgentGatewayRoutes(
  controller: AiAgentGatewayController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/history",
      handler: (context) => controller.clearHistory(context),
    },
    {
      method: "POST",
      path: "/api/ai/routes",
      handler: (context) => controller.registerRoute(context),
    },
    {
      method: "POST",
      path: "/api/ai/execute",
      handler: (context) => controller.execute(context),
    },
    {
      method: "GET",
      path: "/api/ai/agents/:agentId",
      handler: (context) => controller.getAgent(context),
    },
    {
      method: "GET",
      path: "/api/ai/agents",
      handler: (context) => controller.listAgents(context),
    },
    {
      method: "POST",
      path: "/api/ai/agents",
      handler: (context) => controller.registerAgent(context),
    },
  ];
}
