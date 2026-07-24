import type { RateLimitingManagementController } from "@server/api/modules/rate-limiting-management/rate-limiting-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createRateLimitingManagementRoutes(
  controller: RateLimitingManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/rate-limits/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "POST",
      path: "/api/rate-limits/check",
      handler: (context) => controller.check(context),
    },
    {
      method: "POST",
      path: "/api/rate-limits/increment",
      handler: (context) => controller.increment(context),
    },
    {
      method: "POST",
      path: "/api/rate-limits/reset",
      handler: (context) => controller.reset(context),
    },
    {
      method: "GET",
      path: "/api/rate-limits/:ruleId",
      handler: (context) => controller.get(context),
    },
    {
      method: "DELETE",
      path: "/api/rate-limits/:ruleId",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/rate-limits",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/rate-limits",
      handler: (context) => controller.register(context),
    },
  ];
}
