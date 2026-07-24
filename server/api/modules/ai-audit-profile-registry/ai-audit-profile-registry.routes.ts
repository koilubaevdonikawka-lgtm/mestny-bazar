import type { AiAuditProfileRegistryController } from "@server/api/modules/ai-audit-profile-registry/ai-audit-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiAuditProfileRegistryRoutes(
  controller: AiAuditProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/audit-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/audit-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/audit-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/audit-profiles/:auditProfileId",
      handler: (context) => controller.getAuditProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/audit-profiles/:auditProfileId",
      handler: (context) => controller.updateAuditProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/audit-profiles/:auditProfileId",
      handler: (context) => controller.removeAuditProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/audit-profiles",
      handler: (context) => controller.listAuditProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/audit-profiles",
      handler: (context) => controller.registerAuditProfile(context),
    },
  ];
}
