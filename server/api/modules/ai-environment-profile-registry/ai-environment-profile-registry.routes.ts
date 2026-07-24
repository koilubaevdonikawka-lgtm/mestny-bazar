import type { AiEnvironmentProfileRegistryController } from "@server/api/modules/ai-environment-profile-registry/ai-environment-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiEnvironmentProfileRegistryRoutes(
  controller: AiEnvironmentProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/environment-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/environment-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/environment-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/environment-profiles/:environmentProfileId",
      handler: (context) => controller.getEnvironmentProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/environment-profiles/:environmentProfileId",
      handler: (context) => controller.updateEnvironmentProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/environment-profiles/:environmentProfileId",
      handler: (context) => controller.removeEnvironmentProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/environment-profiles",
      handler: (context) => controller.listEnvironmentProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/environment-profiles",
      handler: (context) => controller.registerEnvironmentProfile(context),
    },
  ];
}
