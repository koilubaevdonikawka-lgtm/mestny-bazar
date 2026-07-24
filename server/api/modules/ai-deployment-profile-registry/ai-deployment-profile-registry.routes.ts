import type { AiDeploymentProfileRegistryController } from "@server/api/modules/ai-deployment-profile-registry/ai-deployment-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiDeploymentProfileRegistryRoutes(
  controller: AiDeploymentProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/deployment-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/deployment-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/deployment-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/deployment-profiles/:deploymentProfileId",
      handler: (context) => controller.getDeploymentProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/deployment-profiles/:deploymentProfileId",
      handler: (context) => controller.updateDeploymentProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/deployment-profiles/:deploymentProfileId",
      handler: (context) => controller.removeDeploymentProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/deployment-profiles",
      handler: (context) => controller.listDeploymentProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/deployment-profiles",
      handler: (context) => controller.registerDeploymentProfile(context),
    },
  ];
}
