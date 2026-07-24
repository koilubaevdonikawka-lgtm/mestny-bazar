import type { PaymentController } from "@server/api/integration/payments/payment.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createPaymentRoutes(controller: PaymentController): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/payments/create",
      handler: (context) => controller.create(context),
    },
    {
      method: "POST",
      path: "/api/payments/capture",
      handler: (context) => controller.capture(context),
    },
    {
      method: "POST",
      path: "/api/payments/cancel",
      handler: (context) => controller.cancel(context),
    },
    {
      method: "POST",
      path: "/api/payments/refund",
      handler: (context) => controller.refund(context),
    },
    {
      method: "GET",
      path: "/api/payments/:id/status",
      handler: (context) => controller.getStatus(context),
    },
  ];
}
