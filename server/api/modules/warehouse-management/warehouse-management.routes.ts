import type { WarehouseManagementController } from "@server/api/modules/warehouse-management/warehouse-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createWarehouseManagementRoutes(
  controller: WarehouseManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/warehouse/tasks/:taskId/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/warehouse/tasks/:taskId/cancel",
      handler: (context) => controller.cancel(context),
    },
    {
      method: "POST",
      path: "/api/warehouse/tasks/:taskId/complete",
      handler: (context) => controller.complete(context),
    },
    {
      method: "PATCH",
      path: "/api/warehouse/tasks/:taskId/status",
      handler: (context) => controller.updateStatus(context),
    },
    {
      method: "PATCH",
      path: "/api/warehouse/tasks/:taskId/picker",
      handler: (context) => controller.assignPicker(context),
    },
    {
      method: "GET",
      path: "/api/warehouse/tasks/:taskId",
      handler: (context) => controller.getById(context),
    },
    {
      method: "GET",
      path: "/api/warehouse/tasks",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/warehouse/tasks",
      handler: (context) => controller.create(context),
    },
  ];
}
