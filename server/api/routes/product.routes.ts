import { ProductController } from "@server/api/controllers/product.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createProductRoutes(controller: ProductController): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/products",
      handler: (context) => controller.create(context),
    },
    {
      method: "GET",
      path: "/api/products/:id",
      handler: (context) => controller.getById(context),
    },
  ];
}
