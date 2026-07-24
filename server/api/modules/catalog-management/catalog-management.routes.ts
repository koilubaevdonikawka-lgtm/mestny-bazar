import type { CatalogManagementController } from "@server/api/modules/catalog-management/catalog-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createCatalogManagementRoutes(
  controller: CatalogManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/catalog/products",
      handler: (context) => controller.listProducts(context),
    },
    {
      method: "GET",
      path: "/api/catalog/products/:id/availability",
      handler: (context) => controller.checkAvailability(context),
    },
    {
      method: "GET",
      path: "/api/catalog/products/:id",
      handler: (context) => controller.getProductDetails(context),
    },
    {
      method: "GET",
      path: "/api/catalog/categories/:categoryId",
      handler: (context) => controller.getProductsByCategory(context),
    },
    {
      method: "GET",
      path: "/api/catalog/sellers/:sellerId",
      handler: (context) => controller.getProductsBySeller(context),
    },
    {
      method: "GET",
      path: "/api/catalog/popular",
      handler: (context) => controller.getPopularProducts(context),
    },
    {
      method: "GET",
      path: "/api/catalog/new",
      handler: (context) => controller.getNewestProducts(context),
    },
    {
      method: "GET",
      path: "/api/catalog/recommended",
      handler: (context) => controller.getRecommendedProducts(context),
    },
    {
      method: "GET",
      path: "/api/catalog/related/:productId",
      handler: (context) => controller.getRelatedProducts(context),
    },
  ];
}
