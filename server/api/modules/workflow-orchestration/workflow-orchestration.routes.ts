import type { WorkflowOrchestrationController } from "@server/api/modules/workflow-orchestration/workflow-orchestration.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createWorkflowOrchestrationRoutes(
  controller: WorkflowOrchestrationController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/workflows/orders/:orderId/cancel",
      handler: (context) => controller.cancelOrder(context),
    },
    {
      method: "POST",
      path: "/api/workflows/deliveries/:deliveryId/complete",
      handler: (context) => controller.deliveryCompleted(context),
    },
    {
      method: "POST",
      path: "/api/workflows/warehouse/:taskId/complete",
      handler: (context) => controller.warehouseCompleted(context),
    },
    {
      method: "POST",
      path: "/api/workflows/payments/:paymentId/failed",
      handler: (context) => controller.paymentFailed(context),
    },
    {
      method: "POST",
      path: "/api/workflows/payments/:paymentId/succeeded",
      handler: (context) => controller.paymentSucceeded(context),
    },
    {
      method: "POST",
      path: "/api/workflows/place-order",
      handler: (context) => controller.placeOrder(context),
    },
  ];
}
