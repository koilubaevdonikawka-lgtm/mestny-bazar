import type { AiContextManagementController } from "@server/api/modules/ai-context-management/ai-context-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiContextManagementRoutes(
  controller: AiContextManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/context/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/context/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/context/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/context/:contextId",
      handler: (context) => controller.getContext(context),
    },
    {
      method: "PUT",
      path: "/api/ai/context/:contextId",
      handler: (context) => controller.updateContext(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/context/:contextId",
      handler: (context) => controller.removeContext(context),
    },
    {
      method: "GET",
      path: "/api/ai/context",
      handler: (context) => controller.listContexts(context),
    },
    {
      method: "POST",
      path: "/api/ai/context",
      handler: (context) => controller.createContext(context),
    },
  ];
}
