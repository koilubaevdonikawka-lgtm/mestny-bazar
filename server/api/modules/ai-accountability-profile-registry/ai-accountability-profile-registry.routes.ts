import type { AiAccountabilityProfileRegistryController } from "@server/api/modules/ai-accountability-profile-registry/ai-accountability-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiAccountabilityProfileRegistryRoutes(
  controller: AiAccountabilityProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/accountability-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/accountability-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/accountability-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/accountability-profiles/:accountabilityProfileId",
      handler: (context) => controller.getAccountabilityProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/accountability-profiles/:accountabilityProfileId",
      handler: (context) => controller.updateAccountabilityProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/accountability-profiles/:accountabilityProfileId",
      handler: (context) => controller.removeAccountabilityProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/accountability-profiles",
      handler: (context) => controller.listAccountabilityProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/accountability-profiles",
      handler: (context) => controller.registerAccountabilityProfile(context),
    },
  ];
}
