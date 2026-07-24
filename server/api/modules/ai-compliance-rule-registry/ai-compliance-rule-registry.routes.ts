import type { AiComplianceRuleRegistryController } from "@server/api/modules/ai-compliance-rule-registry/ai-compliance-rule-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiComplianceRuleRegistryRoutes(
  controller: AiComplianceRuleRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/compliance-rules/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/compliance-rules/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/compliance-rules/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/compliance-rules/:complianceRuleId",
      handler: (context) => controller.getComplianceRule(context),
    },
    {
      method: "PUT",
      path: "/api/ai/compliance-rules/:complianceRuleId",
      handler: (context) => controller.updateComplianceRule(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/compliance-rules/:complianceRuleId",
      handler: (context) => controller.removeComplianceRule(context),
    },
    {
      method: "GET",
      path: "/api/ai/compliance-rules",
      handler: (context) => controller.listComplianceRules(context),
    },
    {
      method: "POST",
      path: "/api/ai/compliance-rules",
      handler: (context) => controller.registerComplianceRule(context),
    },
  ];
}
