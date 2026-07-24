import type { AiRuleRegistryController } from "@server/api/modules/ai-rule-registry/ai-rule-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiRuleRegistryRoutes(
  controller: AiRuleRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/rules/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/rules/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/rules/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/rules/:ruleId",
      handler: (context) => controller.getRule(context),
    },
    {
      method: "PUT",
      path: "/api/ai/rules/:ruleId",
      handler: (context) => controller.updateRule(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/rules/:ruleId",
      handler: (context) => controller.removeRule(context),
    },
    {
      method: "GET",
      path: "/api/ai/rules",
      handler: (context) => controller.listRules(context),
    },
    {
      method: "POST",
      path: "/api/ai/rules",
      handler: (context) => controller.registerRule(context),
    },
  ];
}
