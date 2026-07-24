import type { AuthorizationManagementController } from "@server/api/modules/authorization-management/authorization-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAuthorizationManagementRoutes(
  controller: AuthorizationManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/authorization/permissions/:userId",
      handler: (context) => controller.permissions(context),
    },
    {
      method: "POST",
      path: "/api/authorization/policies",
      handler: (context) => controller.registerPolicy(context),
    },
    {
      method: "POST",
      path: "/api/authorization/check",
      handler: (context) => controller.check(context),
    },
    {
      method: "POST",
      path: "/api/authorization/role",
      handler: (context) => controller.role(context),
    },
    {
      method: "POST",
      path: "/api/authorization/permission",
      handler: (context) => controller.permission(context),
    },
    {
      method: "POST",
      path: "/api/authorization/resource",
      handler: (context) => controller.resource(context),
    },
  ];
}
