import type { AiNodeProfileRegistryController } from "@server/api/modules/ai-node-profile-registry/ai-node-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiNodeProfileRegistryRoutes(
  controller: AiNodeProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/node-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/node-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/node-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/node-profiles/:nodeProfileId",
      handler: (context) => controller.getNodeProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/node-profiles/:nodeProfileId",
      handler: (context) => controller.updateNodeProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/node-profiles/:nodeProfileId",
      handler: (context) => controller.removeNodeProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/node-profiles",
      handler: (context) => controller.listNodeProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/node-profiles",
      handler: (context) => controller.registerNodeProfile(context),
    },
  ];
}
