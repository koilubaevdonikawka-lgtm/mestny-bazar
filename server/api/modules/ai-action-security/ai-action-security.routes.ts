import type { AiActionSecurityController } from "@server/api/modules/ai-action-security/ai-action-security.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiActionSecurityRoutes(
  controller: AiActionSecurityController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/security/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/security/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/ai/security/validate",
      handler: (context) => controller.validate(context),
    },
    {
      method: "GET",
      path: "/api/ai/security/policies/:policyId",
      handler: (context) => controller.getPolicy(context),
    },
    {
      method: "PUT",
      path: "/api/ai/security/policies/:policyId",
      handler: (context) => controller.updatePolicy(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/security/policies/:policyId",
      handler: (context) => controller.removePolicy(context),
    },
    {
      method: "GET",
      path: "/api/ai/security/policies",
      handler: (context) => controller.listPolicies(context),
    },
    {
      method: "POST",
      path: "/api/ai/security/policies",
      handler: (context) => controller.registerPolicy(context),
    },
  ];
}
