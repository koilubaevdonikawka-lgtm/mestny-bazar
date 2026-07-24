import { OrderController } from "@server/api/controllers/order.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createOrderRoutes(controller: OrderController): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/orders",
      handler: (context) => controller.create(context),
    },
    {
      method: "GET",
      path: "/api/orders/:id",
      handler: (context) => controller.getById(context),
    },
  ];
}
