import type { AiAcceleratorProfileRegistryController } from "@server/api/modules/ai-accelerator-profile-registry/ai-accelerator-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiAcceleratorProfileRegistryRoutes(
  controller: AiAcceleratorProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/accelerator-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/accelerator-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/accelerator-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/accelerator-profiles/:acceleratorProfileId",
      handler: (context) => controller.getAcceleratorProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/accelerator-profiles/:acceleratorProfileId",
      handler: (context) => controller.updateAcceleratorProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/accelerator-profiles/:acceleratorProfileId",
      handler: (context) => controller.removeAcceleratorProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/accelerator-profiles",
      handler: (context) => controller.listAcceleratorProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/accelerator-profiles",
      handler: (context) => controller.registerAcceleratorProfile(context),
    },
  ];
}
