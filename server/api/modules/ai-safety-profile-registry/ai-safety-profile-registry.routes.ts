import type { AiSafetyProfileRegistryController } from "@server/api/modules/ai-safety-profile-registry/ai-safety-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiSafetyProfileRegistryRoutes(
  controller: AiSafetyProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/safety-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/safety-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/safety-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/safety-profiles/:safetyProfileId",
      handler: (context) => controller.getSafetyProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/safety-profiles/:safetyProfileId",
      handler: (context) => controller.updateSafetyProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/safety-profiles/:safetyProfileId",
      handler: (context) => controller.removeSafetyProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/safety-profiles",
      handler: (context) => controller.listSafetyProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/safety-profiles",
      handler: (context) => controller.registerSafetyProfile(context),
    },
  ];
}
