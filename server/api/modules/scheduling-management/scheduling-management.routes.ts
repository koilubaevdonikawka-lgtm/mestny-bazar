import type { SchedulingManagementController } from "@server/api/modules/scheduling-management/scheduling-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createSchedulingManagementRoutes(
  controller: SchedulingManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/scheduling/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/scheduling/tasks/:taskId/resume",
      handler: (context) => controller.resume(context),
    },
    {
      method: "POST",
      path: "/api/scheduling/tasks/:taskId/pause",
      handler: (context) => controller.pause(context),
    },
    {
      method: "POST",
      path: "/api/scheduling/tasks/:taskId/run",
      handler: (context) => controller.run(context),
    },
    {
      method: "GET",
      path: "/api/scheduling/tasks/:taskId",
      handler: (context) => controller.getById(context),
    },
    {
      method: "DELETE",
      path: "/api/scheduling/tasks/:taskId",
      handler: (context) => controller.delete(context),
    },
    {
      method: "GET",
      path: "/api/scheduling/tasks",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/scheduling/tasks",
      handler: (context) => controller.create(context),
    },
  ];
}
