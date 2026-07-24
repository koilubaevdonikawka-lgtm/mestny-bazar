import type { AiStrategyRegistryController } from "@server/api/modules/ai-strategy-registry/ai-strategy-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiStrategyRegistryRoutes(
  controller: AiStrategyRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/strategies/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/strategies/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/strategies/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/strategies/:strategyId",
      handler: (context) => controller.getStrategy(context),
    },
    {
      method: "PUT",
      path: "/api/ai/strategies/:strategyId",
      handler: (context) => controller.updateStrategy(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/strategies/:strategyId",
      handler: (context) => controller.removeStrategy(context),
    },
    {
      method: "GET",
      path: "/api/ai/strategies",
      handler: (context) => controller.listStrategies(context),
    },
    {
      method: "POST",
      path: "/api/ai/strategies",
      handler: (context) => controller.registerStrategy(context),
    },
  ];
}
