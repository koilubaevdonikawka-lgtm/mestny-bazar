import type { LoggingManagementController } from "@server/api/modules/logging-management/logging-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createLoggingManagementRoutes(
  controller: LoggingManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/logs/export",
      handler: (context) => controller.export(context),
    },
    {
      method: "POST",
      path: "/api/logs/search",
      handler: (context) => controller.search(context),
    },
    {
      method: "POST",
      path: "/api/logs/filter",
      handler: (context) => controller.filter(context),
    },
    {
      method: "GET",
      path: "/api/logs/:logId",
      handler: (context) => controller.get(context),
    },
    {
      method: "DELETE",
      path: "/api/logs/:logId",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/logs",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/logs",
      handler: (context) => controller.write(context),
    },
    {
      method: "DELETE",
      path: "/api/logs",
      handler: (context) => controller.clear(context),
    },
  ];
}
