import type { NotificationController } from "@server/api/integration/notifications/notification.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createNotificationRoutes(
  controller: NotificationController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/notifications/send",
      handler: (context) => controller.sendTest(context),
    },
  ];
}
