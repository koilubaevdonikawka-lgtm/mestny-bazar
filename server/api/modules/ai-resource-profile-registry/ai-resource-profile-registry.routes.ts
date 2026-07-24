import type { AiResourceProfileRegistryController } from "@server/api/modules/ai-resource-profile-registry/ai-resource-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiResourceProfileRegistryRoutes(
  controller: AiResourceProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/resource-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/resource-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/resource-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/resource-profiles/:resourceProfileId",
      handler: (context) => controller.getResourceProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/resource-profiles/:resourceProfileId",
      handler: (context) => controller.updateResourceProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/resource-profiles/:resourceProfileId",
      handler: (context) => controller.removeResourceProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/resource-profiles",
      handler: (context) => controller.listResourceProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/resource-profiles",
      handler: (context) => controller.registerResourceProfile(context),
    },
  ];
}
