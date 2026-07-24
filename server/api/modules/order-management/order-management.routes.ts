import type { OrderManagementController } from "@server/api/modules/order-management/order-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createOrderManagementRoutes(
  controller: OrderManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/orders/:orderId/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/orders/:orderId/cancel",
      handler: (context) => controller.cancel(context),
    },
    {
      method: "PATCH",
      path: "/api/orders/:orderId/status",
      handler: (context) => controller.updateStatus(context),
    },
    {
      method: "GET",
      path: "/api/orders/:orderId",
      handler: (context) => controller.getById(context),
    },
    {
      method: "POST",
      path: "/api/orders",
      handler: (context) => controller.create(context),
    },
    {
      method: "GET",
      path: "/api/orders",
      handler: (context) => controller.list(context),
    },
  ];
}
