import type { AiTrustProfileRegistryController } from "@server/api/modules/ai-trust-profile-registry/ai-trust-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiTrustProfileRegistryRoutes(
  controller: AiTrustProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/trust-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/trust-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/trust-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/trust-profiles/:trustProfileId",
      handler: (context) => controller.getTrustProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/trust-profiles/:trustProfileId",
      handler: (context) => controller.updateTrustProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/trust-profiles/:trustProfileId",
      handler: (context) => controller.removeTrustProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/trust-profiles",
      handler: (context) => controller.listTrustProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/trust-profiles",
      handler: (context) => controller.registerTrustProfile(context),
    },
  ];
}
