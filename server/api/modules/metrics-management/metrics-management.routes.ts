import type { MetricsManagementController } from "@server/api/modules/metrics-management/metrics-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createMetricsManagementRoutes(
  controller: MetricsManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/metrics/export",
      handler: (context) => controller.export(context),
    },
    {
      method: "POST",
      path: "/api/metrics/aggregate",
      handler: (context) => controller.aggregate(context),
    },
    {
      method: "GET",
      path: "/api/metrics/:metricId/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "POST",
      path: "/api/metrics/:metricId/values",
      handler: (context) => controller.recordValue(context),
    },
    {
      method: "GET",
      path: "/api/metrics/:metricId",
      handler: (context) => controller.get(context),
    },
    {
      method: "DELETE",
      path: "/api/metrics/:metricId",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/metrics",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/metrics",
      handler: (context) => controller.register(context),
    },
  ];
}
