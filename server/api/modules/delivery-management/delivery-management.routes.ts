import type { DeliveryManagementController } from "@server/api/modules/delivery-management/delivery-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createDeliveryManagementRoutes(
  controller: DeliveryManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/deliveries/:deliveryId/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/deliveries/:deliveryId/cancel",
      handler: (context) => controller.cancel(context),
    },
    {
      method: "PATCH",
      path: "/api/deliveries/:deliveryId/status",
      handler: (context) => controller.updateStatus(context),
    },
    {
      method: "PATCH",
      path: "/api/deliveries/:deliveryId/courier",
      handler: (context) => controller.assignCourier(context),
    },
    {
      method: "GET",
      path: "/api/deliveries/:deliveryId",
      handler: (context) => controller.getById(context),
    },
    {
      method: "GET",
      path: "/api/deliveries",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/deliveries",
      handler: (context) => controller.create(context),
    },
  ];
}
