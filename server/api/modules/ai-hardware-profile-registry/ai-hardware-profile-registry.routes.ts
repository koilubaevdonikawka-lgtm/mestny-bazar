import type { AiHardwareProfileRegistryController } from "@server/api/modules/ai-hardware-profile-registry/ai-hardware-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiHardwareProfileRegistryRoutes(
  controller: AiHardwareProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/hardware-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/hardware-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/hardware-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/hardware-profiles/:hardwareProfileId",
      handler: (context) => controller.getHardwareProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/hardware-profiles/:hardwareProfileId",
      handler: (context) => controller.updateHardwareProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/hardware-profiles/:hardwareProfileId",
      handler: (context) => controller.removeHardwareProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/hardware-profiles",
      handler: (context) => controller.listHardwareProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/hardware-profiles",
      handler: (context) => controller.registerHardwareProfile(context),
    },
  ];
}
