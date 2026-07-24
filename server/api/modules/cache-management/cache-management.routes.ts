import type { CacheManagementController } from "@server/api/modules/cache-management/cache-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createCacheManagementRoutes(
  controller: CacheManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/cache/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/cache/keys",
      handler: (context) => controller.listKeys(context),
    },
    {
      method: "GET",
      path: "/api/cache/exists/:key",
      handler: (context) => controller.exists(context),
    },
    {
      method: "DELETE",
      path: "/api/cache/group/:group",
      handler: (context) => controller.removeGroup(context),
    },
    {
      method: "GET",
      path: "/api/cache/:key",
      handler: (context) => controller.get(context),
    },
    {
      method: "DELETE",
      path: "/api/cache/:key",
      handler: (context) => controller.remove(context),
    },
    {
      method: "DELETE",
      path: "/api/cache",
      handler: (context) => controller.clear(context),
    },
    {
      method: "POST",
      path: "/api/cache",
      handler: (context) => controller.set(context),
    },
  ];
}
