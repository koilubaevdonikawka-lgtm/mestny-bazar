import type { AiServiceProfileRegistryController } from "@server/api/modules/ai-service-profile-registry/ai-service-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiServiceProfileRegistryRoutes(
  controller: AiServiceProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/service-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/service-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/service-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/service-profiles/:serviceProfileId",
      handler: (context) => controller.getServiceProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/service-profiles/:serviceProfileId",
      handler: (context) => controller.updateServiceProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/service-profiles/:serviceProfileId",
      handler: (context) => controller.removeServiceProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/service-profiles",
      handler: (context) => controller.listServiceProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/service-profiles",
      handler: (context) => controller.registerServiceProfile(context),
    },
  ];
}
