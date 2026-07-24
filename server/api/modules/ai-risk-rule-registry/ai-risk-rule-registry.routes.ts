import type { AiRiskRuleRegistryController } from "@server/api/modules/ai-risk-rule-registry/ai-risk-rule-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiRiskRuleRegistryRoutes(
  controller: AiRiskRuleRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/risk-rules/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/risk-rules/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/risk-rules/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/risk-rules/:riskRuleId",
      handler: (context) => controller.getRiskRule(context),
    },
    {
      method: "PUT",
      path: "/api/ai/risk-rules/:riskRuleId",
      handler: (context) => controller.updateRiskRule(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/risk-rules/:riskRuleId",
      handler: (context) => controller.removeRiskRule(context),
    },
    {
      method: "GET",
      path: "/api/ai/risk-rules",
      handler: (context) => controller.listRiskRules(context),
    },
    {
      method: "POST",
      path: "/api/ai/risk-rules",
      handler: (context) => controller.registerRiskRule(context),
    },
  ];
}
