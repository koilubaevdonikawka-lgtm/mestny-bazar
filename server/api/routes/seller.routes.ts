import { SellerController } from "@server/api/controllers/seller.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createSellerRoutes(controller: SellerController): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/sellers",
      handler: (context) => controller.register(context),
    },
    {
      method: "GET",
      path: "/api/sellers/:id",
      handler: (context) => controller.getById(context),
    },
  ];
}
