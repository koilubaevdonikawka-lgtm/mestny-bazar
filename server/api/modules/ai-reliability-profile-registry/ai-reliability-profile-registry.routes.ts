import type { AiReliabilityProfileRegistryController } from "@server/api/modules/ai-reliability-profile-registry/ai-reliability-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiReliabilityProfileRegistryRoutes(
  controller: AiReliabilityProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/reliability-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/reliability-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/reliability-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/reliability-profiles/:reliabilityProfileId",
      handler: (context) => controller.getReliabilityProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/reliability-profiles/:reliabilityProfileId",
      handler: (context) => controller.updateReliabilityProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/reliability-profiles/:reliabilityProfileId",
      handler: (context) => controller.removeReliabilityProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/reliability-profiles",
      handler: (context) => controller.listReliabilityProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/reliability-profiles",
      handler: (context) => controller.registerReliabilityProfile(context),
    },
  ];
}
