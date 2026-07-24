import type { NotificationManagementController } from "@server/api/modules/notification-management/notification-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createNotificationManagementRoutes(
  controller: NotificationManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/notifications/:notificationId/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/notifications/:notificationId/cancel",
      handler: (context) => controller.cancel(context),
    },
    {
      method: "POST",
      path: "/api/notifications/:notificationId/retry",
      handler: (context) => controller.retry(context),
    },
    {
      method: "POST",
      path: "/api/notifications/:notificationId/send",
      handler: (context) => controller.send(context),
    },
    {
      method: "GET",
      path: "/api/notifications/:notificationId",
      handler: (context) => controller.getById(context),
    },
    {
      method: "GET",
      path: "/api/notifications",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/notifications",
      handler: (context) => controller.create(context),
    },
  ];
}
