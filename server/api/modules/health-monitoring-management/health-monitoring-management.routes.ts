import type { HealthMonitoringManagementController } from "@server/api/modules/health-monitoring-management/health-monitoring-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createHealthMonitoringManagementRoutes(
  controller: HealthMonitoringManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/health/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "GET",
      path: "/api/health/system",
      handler: (context) => controller.system(context),
    },
    {
      method: "POST",
      path: "/api/health/run-all",
      handler: (context) => controller.runAll(context),
    },
    {
      method: "GET",
      path: "/api/health/component/:componentId",
      handler: (context) => controller.component(context),
    },
    {
      method: "POST",
      path: "/api/health/checks/:checkId/run",
      handler: (context) => controller.run(context),
    },
    {
      method: "DELETE",
      path: "/api/health/checks/:checkId",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/health/checks",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/health/checks",
      handler: (context) => controller.register(context),
    },
  ];
}
