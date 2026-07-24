import type { AiRuntimeProfileRegistryController } from "@server/api/modules/ai-runtime-profile-registry/ai-runtime-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiRuntimeProfileRegistryRoutes(
  controller: AiRuntimeProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/runtime-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/runtime-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/runtime-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/runtime-profiles/:runtimeProfileId",
      handler: (context) => controller.getRuntimeProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/runtime-profiles/:runtimeProfileId",
      handler: (context) => controller.updateRuntimeProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/runtime-profiles/:runtimeProfileId",
      handler: (context) => controller.removeRuntimeProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/runtime-profiles",
      handler: (context) => controller.listRuntimeProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/runtime-profiles",
      handler: (context) => controller.registerRuntimeProfile(context),
    },
  ];
}
