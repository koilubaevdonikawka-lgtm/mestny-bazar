import type { FavoritesController } from "@server/api/modules/favorites/favorites.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createFavoritesRoutes(controller: FavoritesController): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/favorites",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/favorites",
      handler: (context) => controller.add(context),
    },
    {
      method: "DELETE",
      path: "/api/favorites/:productId",
      handler: (context) => controller.remove(context),
    },
  ];
}
