import type { AiResourcePoolRegistryController } from "@server/api/modules/ai-resource-pool-registry/ai-resource-pool-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiResourcePoolRegistryRoutes(
  controller: AiResourcePoolRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/resource-pools/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/resource-pools/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/resource-pools/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/resource-pools/:resourcePoolId",
      handler: (context) => controller.getResourcePool(context),
    },
    {
      method: "PUT",
      path: "/api/ai/resource-pools/:resourcePoolId",
      handler: (context) => controller.updateResourcePool(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/resource-pools/:resourcePoolId",
      handler: (context) => controller.removeResourcePool(context),
    },
    {
      method: "GET",
      path: "/api/ai/resource-pools",
      handler: (context) => controller.listResourcePools(context),
    },
    {
      method: "POST",
      path: "/api/ai/resource-pools",
      handler: (context) => controller.registerResourcePool(context),
    },
  ];
}
