import type { AiRiskProfileRegistryController } from "@server/api/modules/ai-risk-profile-registry/ai-risk-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiRiskProfileRegistryRoutes(
  controller: AiRiskProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/risk-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/risk-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/risk-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/risk-profiles/:riskProfileId",
      handler: (context) => controller.getRiskProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/risk-profiles/:riskProfileId",
      handler: (context) => controller.updateRiskProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/risk-profiles/:riskProfileId",
      handler: (context) => controller.removeRiskProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/risk-profiles",
      handler: (context) => controller.listRiskProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/risk-profiles",
      handler: (context) => controller.registerRiskProfile(context),
    },
  ];
}
