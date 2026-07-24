import type { PaymentManagementController } from "@server/api/modules/payment-management/payment-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createPaymentManagementRoutes(
  controller: PaymentManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/payments/:paymentId/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/payments/:paymentId/cancel",
      handler: (context) => controller.cancel(context),
    },
    {
      method: "POST",
      path: "/api/payments/:paymentId/fail",
      handler: (context) => controller.fail(context),
    },
    {
      method: "POST",
      path: "/api/payments/:paymentId/confirm",
      handler: (context) => controller.confirm(context),
    },
    {
      method: "GET",
      path: "/api/payments/:paymentId",
      handler: (context) => controller.getById(context),
    },
    {
      method: "POST",
      path: "/api/payments",
      handler: (context) => controller.create(context),
    },
  ];
}
