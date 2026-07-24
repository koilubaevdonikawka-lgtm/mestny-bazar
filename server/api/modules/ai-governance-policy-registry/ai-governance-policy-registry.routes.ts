import type { AiGovernancePolicyRegistryController } from "@server/api/modules/ai-governance-policy-registry/ai-governance-policy-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiGovernancePolicyRegistryRoutes(
  controller: AiGovernancePolicyRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/governance-policies/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/governance-policies/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/governance-policies/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/governance-policies/:governancePolicyId",
      handler: (context) => controller.getGovernancePolicy(context),
    },
    {
      method: "PUT",
      path: "/api/ai/governance-policies/:governancePolicyId",
      handler: (context) => controller.updateGovernancePolicy(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/governance-policies/:governancePolicyId",
      handler: (context) => controller.removeGovernancePolicy(context),
    },
    {
      method: "GET",
      path: "/api/ai/governance-policies",
      handler: (context) => controller.listGovernancePolicies(context),
    },
    {
      method: "POST",
      path: "/api/ai/governance-policies",
      handler: (context) => controller.registerGovernancePolicy(context),
    },
  ];
}
