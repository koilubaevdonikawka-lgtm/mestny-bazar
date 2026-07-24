import type { PluginManagementController } from "@server/api/modules/plugin-management/plugin-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createPluginManagementRoutes(
  controller: PluginManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/plugins/register",
      handler: (context) => controller.register(context),
    },
    {
      method: "POST",
      path: "/api/plugins/install",
      handler: (context) => controller.install(context),
    },
    {
      method: "GET",
      path: "/api/plugins/:pluginId/status",
      handler: (context) => controller.status(context),
    },
    {
      method: "POST",
      path: "/api/plugins/:pluginId/enable",
      handler: (context) => controller.enable(context),
    },
    {
      method: "POST",
      path: "/api/plugins/:pluginId/disable",
      handler: (context) => controller.disable(context),
    },
    {
      method: "GET",
      path: "/api/plugins/:pluginId",
      handler: (context) => controller.get(context),
    },
    {
      method: "DELETE",
      path: "/api/plugins/:pluginId",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/plugins",
      handler: (context) => controller.list(context),
    },
  ];
}
