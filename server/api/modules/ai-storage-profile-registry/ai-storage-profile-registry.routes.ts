import type { AiStorageProfileRegistryController } from "@server/api/modules/ai-storage-profile-registry/ai-storage-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiStorageProfileRegistryRoutes(
  controller: AiStorageProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/storage-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/storage-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/storage-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/storage-profiles/:storageProfileId",
      handler: (context) => controller.getStorageProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/storage-profiles/:storageProfileId",
      handler: (context) => controller.updateStorageProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/storage-profiles/:storageProfileId",
      handler: (context) => controller.removeStorageProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/storage-profiles",
      handler: (context) => controller.listStorageProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/storage-profiles",
      handler: (context) => controller.registerStorageProfile(context),
    },
  ];
}
