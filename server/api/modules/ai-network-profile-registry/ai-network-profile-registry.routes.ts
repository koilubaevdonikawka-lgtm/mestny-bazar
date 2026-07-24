import type { AiNetworkProfileRegistryController } from "@server/api/modules/ai-network-profile-registry/ai-network-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiNetworkProfileRegistryRoutes(
  controller: AiNetworkProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/network-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/network-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/network-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/network-profiles/:networkProfileId",
      handler: (context) => controller.getNetworkProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/network-profiles/:networkProfileId",
      handler: (context) => controller.updateNetworkProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/network-profiles/:networkProfileId",
      handler: (context) => controller.removeNetworkProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/network-profiles",
      handler: (context) => controller.listNetworkProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/network-profiles",
      handler: (context) => controller.registerNetworkProfile(context),
    },
  ];
}
