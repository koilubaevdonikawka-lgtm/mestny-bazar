import type { AiMemoryProfileRegistryController } from "@server/api/modules/ai-memory-profile-registry/ai-memory-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiMemoryProfileRegistryRoutes(
  controller: AiMemoryProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/memory-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/memory-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/memory-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/memory-profiles/:memoryProfileId",
      handler: (context) => controller.getMemoryProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/memory-profiles/:memoryProfileId",
      handler: (context) => controller.updateMemoryProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/memory-profiles/:memoryProfileId",
      handler: (context) => controller.removeMemoryProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/memory-profiles",
      handler: (context) => controller.listMemoryProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/memory-profiles",
      handler: (context) => controller.registerMemoryProfile(context),
    },
  ];
}
