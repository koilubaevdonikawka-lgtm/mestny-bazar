import type { AuthenticationManagementController } from "@server/api/modules/authentication-management/authentication-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAuthenticationManagementRoutes(
  controller: AuthenticationManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/authentication/login",
      handler: (context) => controller.login(context),
    },
    {
      method: "POST",
      path: "/api/authentication/logout",
      handler: (context) => controller.logout(context),
    },
    {
      method: "POST",
      path: "/api/authentication/refresh",
      handler: (context) => controller.refresh(context),
    },
    {
      method: "POST",
      path: "/api/authentication/revoke",
      handler: (context) => controller.revoke(context),
    },
    {
      method: "GET",
      path: "/api/authentication/session",
      handler: (context) => controller.session(context),
    },
    {
      method: "POST",
      path: "/api/authentication/validate",
      handler: (context) => controller.validate(context),
    },
  ];
}
