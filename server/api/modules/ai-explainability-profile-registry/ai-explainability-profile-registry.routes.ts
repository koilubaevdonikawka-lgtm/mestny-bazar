import type { AiExplainabilityProfileRegistryController } from "@server/api/modules/ai-explainability-profile-registry/ai-explainability-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiExplainabilityProfileRegistryRoutes(
  controller: AiExplainabilityProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/explainability-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/explainability-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/explainability-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/explainability-profiles/:explainabilityProfileId",
      handler: (context) => controller.getExplainabilityProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/explainability-profiles/:explainabilityProfileId",
      handler: (context) => controller.updateExplainabilityProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/explainability-profiles/:explainabilityProfileId",
      handler: (context) => controller.removeExplainabilityProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/explainability-profiles",
      handler: (context) => controller.listExplainabilityProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/explainability-profiles",
      handler: (context) => controller.registerExplainabilityProfile(context),
    },
  ];
}
