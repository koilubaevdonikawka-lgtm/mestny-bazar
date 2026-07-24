import type { OrderLifecycleController } from "@server/api/modules/order-lifecycle/order-lifecycle.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createOrderLifecycleRoutes(
  controller: OrderLifecycleController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/orders/:id/assign-courier",
      handler: (context) => controller.assignCourier(context),
    },
    {
      method: "POST",
      path: "/api/orders/:id/accept",
      handler: (context) => controller.accept(context),
    },
    {
      method: "POST",
      path: "/api/orders/:id/start",
      handler: (context) => controller.start(context),
    },
    {
      method: "POST",
      path: "/api/orders/:id/arrive",
      handler: (context) => controller.arrive(context),
    },
    {
      method: "POST",
      path: "/api/orders/:id/deliver",
      handler: (context) => controller.deliver(context),
    },
    {
      method: "POST",
      path: "/api/orders/:id/cancel",
      handler: (context) => controller.cancel(context),
    },
    {
      method: "POST",
      path: "/api/orders/:id/return",
      handler: (context) => controller.returnOrder(context),
    },
    {
      method: "POST",
      path: "/api/orders/:id/refund",
      handler: (context) => controller.refund(context),
    },
    {
      method: "GET",
      path: "/api/orders/:id/timeline",
      handler: (context) => controller.timeline(context),
    },
  ];
}
