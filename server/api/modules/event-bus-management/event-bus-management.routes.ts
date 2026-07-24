import type { EventBusManagementController } from "@server/api/modules/event-bus-management/event-bus-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createEventBusManagementRoutes(
  controller: EventBusManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/events/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "DELETE",
      path: "/api/events/history",
      handler: (context) => controller.clearHistory(context),
    },
    {
      method: "POST",
      path: "/api/events/register",
      handler: (context) => controller.register(context),
    },
    {
      method: "POST",
      path: "/api/events/publish",
      handler: (context) => controller.publish(context),
    },
    {
      method: "POST",
      path: "/api/events/subscribe",
      handler: (context) => controller.subscribe(context),
    },
    {
      method: "POST",
      path: "/api/events/unsubscribe",
      handler: (context) => controller.unsubscribe(context),
    },
    {
      method: "GET",
      path: "/api/events/:eventId",
      handler: (context) => controller.get(context),
    },
    {
      method: "GET",
      path: "/api/events",
      handler: (context) => controller.list(context),
    },
  ];
}
