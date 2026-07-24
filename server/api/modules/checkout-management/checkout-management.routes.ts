import type { CheckoutManagementController } from "@server/api/modules/checkout-management/checkout-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createCheckoutManagementRoutes(
  controller: CheckoutManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/checkout/validate",
      handler: (context) => controller.validate(context),
    },
    {
      method: "POST",
      path: "/api/checkout",
      handler: (context) => controller.create(context),
    },
    {
      method: "GET",
      path: "/api/checkout/:checkoutId",
      handler: (context) => controller.getSummary(context),
    },
    {
      method: "POST",
      path: "/api/checkout/:checkoutId/refresh",
      handler: (context) => controller.refresh(context),
    },
    {
      method: "DELETE",
      path: "/api/checkout/:checkoutId",
      handler: (context) => controller.cancel(context),
    },
  ];
}
