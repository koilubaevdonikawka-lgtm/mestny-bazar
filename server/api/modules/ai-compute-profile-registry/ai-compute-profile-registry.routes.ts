import type { AiComputeProfileRegistryController } from "@server/api/modules/ai-compute-profile-registry/ai-compute-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiComputeProfileRegistryRoutes(
  controller: AiComputeProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/compute-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/compute-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/compute-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/compute-profiles/:computeProfileId",
      handler: (context) => controller.getComputeProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/compute-profiles/:computeProfileId",
      handler: (context) => controller.updateComputeProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/compute-profiles/:computeProfileId",
      handler: (context) => controller.removeComputeProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/compute-profiles",
      handler: (context) => controller.listComputeProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/compute-profiles",
      handler: (context) => controller.registerComputeProfile(context),
    },
  ];
}
