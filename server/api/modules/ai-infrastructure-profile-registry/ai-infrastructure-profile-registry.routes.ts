import type { AiInfrastructureProfileRegistryController } from "@server/api/modules/ai-infrastructure-profile-registry/ai-infrastructure-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiInfrastructureProfileRegistryRoutes(
  controller: AiInfrastructureProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/infrastructure-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/infrastructure-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/infrastructure-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/infrastructure-profiles/:infrastructureProfileId",
      handler: (context) => controller.getInfrastructureProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/infrastructure-profiles/:infrastructureProfileId",
      handler: (context) => controller.updateInfrastructureProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/infrastructure-profiles/:infrastructureProfileId",
      handler: (context) => controller.removeInfrastructureProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/infrastructure-profiles",
      handler: (context) => controller.listInfrastructureProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/infrastructure-profiles",
      handler: (context) => controller.registerInfrastructureProfile(context),
    },
  ];
}
