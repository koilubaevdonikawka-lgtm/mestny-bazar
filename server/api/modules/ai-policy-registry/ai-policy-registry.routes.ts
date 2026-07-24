import type { AiPolicyRegistryController } from "@server/api/modules/ai-policy-registry/ai-policy-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiPolicyRegistryRoutes(
  controller: AiPolicyRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/policies/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/policies/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/policies/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/policies/:policyId",
      handler: (context) => controller.getPolicy(context),
    },
    {
      method: "PUT",
      path: "/api/ai/policies/:policyId",
      handler: (context) => controller.updatePolicy(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/policies/:policyId",
      handler: (context) => controller.removePolicy(context),
    },
    {
      method: "GET",
      path: "/api/ai/policies",
      handler: (context) => controller.listPolicies(context),
    },
    {
      method: "POST",
      path: "/api/ai/policies",
      handler: (context) => controller.registerPolicy(context),
    },
  ];
}
