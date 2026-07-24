import type { AiSemanticApiController } from "@server/api/modules/ai-semantic-api/ai-semantic-api.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiSemanticApiRoutes(
  controller: AiSemanticApiController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/semantic/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/semantic/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/ai/semantic/request",
      handler: (context) => controller.handleRequest(context),
    },
    {
      method: "GET",
      path: "/api/ai/semantic/endpoints/:endpointId",
      handler: (context) => controller.getEndpoint(context),
    },
    {
      method: "PUT",
      path: "/api/ai/semantic/endpoints/:endpointId",
      handler: (context) => controller.updateEndpoint(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/semantic/endpoints/:endpointId",
      handler: (context) => controller.removeEndpoint(context),
    },
    {
      method: "GET",
      path: "/api/ai/semantic/endpoints",
      handler: (context) => controller.listEndpoints(context),
    },
    {
      method: "POST",
      path: "/api/ai/semantic/endpoints",
      handler: (context) => controller.registerEndpoint(context),
    },
  ];
}
