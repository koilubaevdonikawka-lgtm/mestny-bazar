import type { SecretsManagementController } from "@server/api/modules/secrets-management/secrets-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createSecretsManagementRoutes(
  controller: SecretsManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/secrets/export",
      handler: (context) => controller.exportMetadata(context),
    },
    {
      method: "POST",
      path: "/api/secrets/import",
      handler: (context) => controller.importMetadata(context),
    },
    {
      method: "GET",
      path: "/api/secrets/exists/:key",
      handler: (context) => controller.exists(context),
    },
    {
      method: "GET",
      path: "/api/secrets/:key",
      handler: (context) => controller.get(context),
    },
    {
      method: "PUT",
      path: "/api/secrets/:key",
      handler: (context) => controller.update(context),
    },
    {
      method: "DELETE",
      path: "/api/secrets/:key",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/secrets",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/secrets",
      handler: (context) => controller.register(context),
    },
  ];
}
