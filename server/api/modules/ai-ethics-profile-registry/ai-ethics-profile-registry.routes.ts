import type { AiEthicsProfileRegistryController } from "@server/api/modules/ai-ethics-profile-registry/ai-ethics-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiEthicsProfileRegistryRoutes(
  controller: AiEthicsProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/ethics-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/ethics-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/ethics-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/ethics-profiles/:ethicsProfileId",
      handler: (context) => controller.getEthicsProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/ethics-profiles/:ethicsProfileId",
      handler: (context) => controller.updateEthicsProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/ethics-profiles/:ethicsProfileId",
      handler: (context) => controller.removeEthicsProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/ethics-profiles",
      handler: (context) => controller.listEthicsProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/ethics-profiles",
      handler: (context) => controller.registerEthicsProfile(context),
    },
  ];
}
