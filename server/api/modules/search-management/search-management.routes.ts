import type { SearchManagementController } from "@server/api/modules/search-management/search-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createSearchManagementRoutes(
  controller: SearchManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/search/suggestions",
      handler: (context) => controller.suggestions(context),
    },
    {
      method: "GET",
      path: "/api/search/autocomplete",
      handler: (context) => controller.autocomplete(context),
    },
    {
      method: "GET",
      path: "/api/search/category/:id",
      handler: (context) => controller.searchByCategory(context),
    },
    {
      method: "GET",
      path: "/api/search/seller/:id",
      handler: (context) => controller.searchBySeller(context),
    },
    {
      method: "GET",
      path: "/api/search",
      handler: (context) => controller.search(context),
    },
  ];
}
