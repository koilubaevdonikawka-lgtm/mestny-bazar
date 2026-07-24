import type { FinikWebhookController } from "@server/api/integration/webhooks/finik-webhook.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createFinikWebhookRoutes(
  controller: FinikWebhookController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/webhooks/finik",
      handler: (context) => controller.handle(context),
    },
    {
      method: "POST",
      path: "/webhooks/finik",
      handler: (context) => controller.handle(context),
    },
  ];
}
