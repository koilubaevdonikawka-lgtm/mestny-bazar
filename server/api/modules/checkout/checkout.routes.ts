import type { CheckoutController } from "@server/api/modules/checkout/checkout.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createCheckoutRoutes(controller: CheckoutController): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/checkout",
      handler: (context) => controller.create(context),
    },
    {
      method: "POST",
      path: "/api/checkout/:id/validate",
      handler: (context) => controller.validate(context),
    },
    {
      method: "POST",
      path: "/api/checkout/:id/place-order",
      handler: (context) => controller.placeOrder(context),
    },
  ];
}
