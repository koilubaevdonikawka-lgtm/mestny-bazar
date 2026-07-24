import type { AiClusterProfileRegistryController } from "@server/api/modules/ai-cluster-profile-registry/ai-cluster-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiClusterProfileRegistryRoutes(
  controller: AiClusterProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/cluster-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/cluster-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/cluster-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/cluster-profiles/:clusterProfileId",
      handler: (context) => controller.getClusterProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/cluster-profiles/:clusterProfileId",
      handler: (context) => controller.updateClusterProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/cluster-profiles/:clusterProfileId",
      handler: (context) => controller.removeClusterProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/cluster-profiles",
      handler: (context) => controller.listClusterProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/cluster-profiles",
      handler: (context) => controller.registerClusterProfile(context),
    },
  ];
}
