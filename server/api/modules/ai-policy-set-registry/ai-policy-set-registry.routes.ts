import type { AiPolicySetRegistryController } from "@server/api/modules/ai-policy-set-registry/ai-policy-set-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiPolicySetRegistryRoutes(
  controller: AiPolicySetRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/policy-sets/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/policy-sets/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/policy-sets/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/policy-sets/:policySetId",
      handler: (context) => controller.getPolicySet(context),
    },
    {
      method: "PUT",
      path: "/api/ai/policy-sets/:policySetId",
      handler: (context) => controller.updatePolicySet(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/policy-sets/:policySetId",
      handler: (context) => controller.removePolicySet(context),
    },
    {
      method: "GET",
      path: "/api/ai/policy-sets",
      handler: (context) => controller.listPolicySets(context),
    },
    {
      method: "POST",
      path: "/api/ai/policy-sets",
      handler: (context) => controller.registerPolicySet(context),
    },
  ];
}
