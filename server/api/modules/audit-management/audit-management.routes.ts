import type { AuditManagementController } from "@server/api/modules/audit-management/audit-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAuditManagementRoutes(
  controller: AuditManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/audit/range",
      handler: (context) => controller.byDateRange(context),
    },
    {
      method: "GET",
      path: "/api/audit/user/:userId",
      handler: (context) => controller.byUser(context),
    },
    {
      method: "GET",
      path: "/api/audit/module/:module",
      handler: (context) => controller.byModule(context),
    },
    {
      method: "GET",
      path: "/api/audit/event/:eventType",
      handler: (context) => controller.byEventType(context),
    },
    {
      method: "GET",
      path: "/api/audit/:auditId",
      handler: (context) => controller.getById(context),
    },
    {
      method: "GET",
      path: "/api/audit",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/audit",
      handler: (context) => controller.write(context),
    },
  ];
}
