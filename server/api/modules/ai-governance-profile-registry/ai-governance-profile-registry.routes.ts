import type { AiGovernanceProfileRegistryController } from "@server/api/modules/ai-governance-profile-registry/ai-governance-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiGovernanceProfileRegistryRoutes(
  controller: AiGovernanceProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/governance-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/governance-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/governance-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/governance-profiles/:governanceProfileId",
      handler: (context) => controller.getGovernanceProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/governance-profiles/:governanceProfileId",
      handler: (context) => controller.updateGovernanceProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/governance-profiles/:governanceProfileId",
      handler: (context) => controller.removeGovernanceProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/governance-profiles",
      handler: (context) => controller.listGovernanceProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/governance-profiles",
      handler: (context) => controller.registerGovernanceProfile(context),
    },
  ];
}
