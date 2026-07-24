import type { SearchController } from "@server/api/modules/search/search.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createSearchRoutes(controller: SearchController): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/search/products",
      handler: (context) => controller.searchProducts(context),
    },
    {
      method: "GET",
      path: "/api/search/categories",
      handler: (context) => controller.searchCategories(context),
    },
    {
      method: "GET",
      path: "/api/search/sellers",
      handler: (context) => controller.searchSellers(context),
    },
  ];
}
