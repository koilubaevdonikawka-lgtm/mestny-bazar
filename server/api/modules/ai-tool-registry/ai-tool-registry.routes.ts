import type { AiToolRegistryController } from "@server/api/modules/ai-tool-registry/ai-tool-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiToolRegistryRoutes(
  controller: AiToolRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/tools/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/tools/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/tools/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/tools/:toolId",
      handler: (context) => controller.get(context),
    },
    {
      method: "PUT",
      path: "/api/ai/tools/:toolId",
      handler: (context) => controller.update(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/tools/:toolId",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/ai/tools",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/ai/tools",
      handler: (context) => controller.register(context),
    },
  ];
}
