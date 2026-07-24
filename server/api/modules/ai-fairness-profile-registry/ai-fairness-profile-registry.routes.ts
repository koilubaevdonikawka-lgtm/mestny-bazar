import type { AiFairnessProfileRegistryController } from "@server/api/modules/ai-fairness-profile-registry/ai-fairness-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiFairnessProfileRegistryRoutes(
  controller: AiFairnessProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/fairness-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/fairness-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/fairness-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/fairness-profiles/:fairnessProfileId",
      handler: (context) => controller.getFairnessProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/fairness-profiles/:fairnessProfileId",
      handler: (context) => controller.updateFairnessProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/fairness-profiles/:fairnessProfileId",
      handler: (context) => controller.removeFairnessProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/fairness-profiles",
      handler: (context) => controller.listFairnessProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/fairness-profiles",
      handler: (context) => controller.registerFairnessProfile(context),
    },
  ];
}
