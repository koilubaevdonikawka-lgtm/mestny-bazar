import type { AiProfileRegistryController } from "@server/api/modules/ai-profile-registry/ai-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiProfileRegistryRoutes(
  controller: AiProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/profiles/type/:type",
      handler: (context) => controller.listByType(context),
    },
    {
      method: "GET",
      path: "/api/ai/profiles/:profileId",
      handler: (context) => controller.getProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/profiles/:profileId",
      handler: (context) => controller.updateProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/profiles/:profileId",
      handler: (context) => controller.removeProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/profiles",
      handler: (context) => controller.listProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/profiles",
      handler: (context) => controller.registerProfile(context),
    },
  ];
}
