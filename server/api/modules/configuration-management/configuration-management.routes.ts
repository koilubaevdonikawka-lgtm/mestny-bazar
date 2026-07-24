import type { ConfigurationManagementController } from "@server/api/modules/configuration-management/configuration-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createConfigurationManagementRoutes(
  controller: ConfigurationManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/configurations/export",
      handler: (context) => controller.exportConfig(context),
    },
    {
      method: "POST",
      path: "/api/configurations/import",
      handler: (context) => controller.importConfig(context),
    },
    {
      method: "GET",
      path: "/api/configurations/exists/:key",
      handler: (context) => controller.exists(context),
    },
    {
      method: "GET",
      path: "/api/configurations/:key",
      handler: (context) => controller.getByKey(context),
    },
    {
      method: "PUT",
      path: "/api/configurations/:key",
      handler: (context) => controller.update(context),
    },
    {
      method: "DELETE",
      path: "/api/configurations/:key",
      handler: (context) => controller.delete(context),
    },
    {
      method: "GET",
      path: "/api/configurations",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/configurations",
      handler: (context) => controller.create(context),
    },
  ];
}
