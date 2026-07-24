import type { FeatureFlagManagementController } from "@server/api/modules/feature-flag-management/feature-flag-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createFeatureFlagManagementRoutes(
  controller: FeatureFlagManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/feature-flags/:key/status",
      handler: (context) => controller.status(context),
    },
    {
      method: "POST",
      path: "/api/feature-flags/:key/enable",
      handler: (context) => controller.enable(context),
    },
    {
      method: "POST",
      path: "/api/feature-flags/:key/disable",
      handler: (context) => controller.disable(context),
    },
    {
      method: "GET",
      path: "/api/feature-flags/:key",
      handler: (context) => controller.get(context),
    },
    {
      method: "PUT",
      path: "/api/feature-flags/:key",
      handler: (context) => controller.update(context),
    },
    {
      method: "DELETE",
      path: "/api/feature-flags/:key",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/feature-flags",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/feature-flags",
      handler: (context) => controller.register(context),
    },
  ];
}
