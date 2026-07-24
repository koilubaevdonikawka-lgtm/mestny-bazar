import type { AiTransparencyProfileRegistryController } from "@server/api/modules/ai-transparency-profile-registry/ai-transparency-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiTransparencyProfileRegistryRoutes(
  controller: AiTransparencyProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/transparency-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/transparency-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/transparency-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/transparency-profiles/:transparencyProfileId",
      handler: (context) => controller.getTransparencyProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/transparency-profiles/:transparencyProfileId",
      handler: (context) => controller.updateTransparencyProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/transparency-profiles/:transparencyProfileId",
      handler: (context) => controller.removeTransparencyProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/transparency-profiles",
      handler: (context) => controller.listTransparencyProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/transparency-profiles",
      handler: (context) => controller.registerTransparencyProfile(context),
    },
  ];
}
