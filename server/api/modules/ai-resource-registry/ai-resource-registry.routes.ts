import type { AiResourceRegistryController } from "@server/api/modules/ai-resource-registry/ai-resource-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiResourceRegistryRoutes(
  controller: AiResourceRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/resources/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/resources/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/resources/type/:type",
      handler: (context) => controller.listByType(context),
    },
    {
      method: "GET",
      path: "/api/ai/resources/:resourceId",
      handler: (context) => controller.getResource(context),
    },
    {
      method: "PUT",
      path: "/api/ai/resources/:resourceId",
      handler: (context) => controller.updateResource(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/resources/:resourceId",
      handler: (context) => controller.removeResource(context),
    },
    {
      method: "GET",
      path: "/api/ai/resources",
      handler: (context) => controller.listResources(context),
    },
    {
      method: "POST",
      path: "/api/ai/resources",
      handler: (context) => controller.registerResource(context),
    },
  ];
}
