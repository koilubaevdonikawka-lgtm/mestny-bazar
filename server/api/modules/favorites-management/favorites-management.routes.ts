import type { FavoritesManagementController } from "@server/api/modules/favorites-management/favorites-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createFavoritesManagementRoutes(
  controller: FavoritesManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/favorites/check/:productId",
      handler: (context) => controller.check(context),
    },
    {
      method: "GET",
      path: "/api/favorites/count",
      handler: (context) => controller.count(context),
    },
    {
      method: "DELETE",
      path: "/api/favorites",
      handler: (context) => controller.clear(context),
    },
    {
      method: "GET",
      path: "/api/favorites",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/favorites/:productId",
      handler: (context) => controller.add(context),
    },
    {
      method: "DELETE",
      path: "/api/favorites/:productId",
      handler: (context) => controller.remove(context),
    },
  ];
}
