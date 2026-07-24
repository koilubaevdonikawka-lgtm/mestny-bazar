import { CatalogController } from "@server/api/controllers/catalog.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createCatalogRoutes(controller: CatalogController): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/catalogs/:catalogId/categories",
      handler: (context) => controller.createCategory(context),
    },
    {
      method: "GET",
      path: "/api/catalogs/:id",
      handler: (context) => controller.getCatalog(context),
    },
  ];
}
