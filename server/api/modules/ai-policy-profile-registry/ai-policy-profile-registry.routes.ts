import type { AiPolicyProfileRegistryController } from "@server/api/modules/ai-policy-profile-registry/ai-policy-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiPolicyProfileRegistryRoutes(
  controller: AiPolicyProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/policy-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/policy-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/policy-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/policy-profiles/:policyProfileId",
      handler: (context) => controller.getPolicyProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/policy-profiles/:policyProfileId",
      handler: (context) => controller.updatePolicyProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/policy-profiles/:policyProfileId",
      handler: (context) => controller.removePolicyProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/policy-profiles",
      handler: (context) => controller.listPolicyProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/policy-profiles",
      handler: (context) => controller.registerPolicyProfile(context),
    },
  ];
}
