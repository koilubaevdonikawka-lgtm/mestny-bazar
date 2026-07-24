import type { AiScenarioRegistryController } from "@server/api/modules/ai-scenario-registry/ai-scenario-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiScenarioRegistryRoutes(
  controller: AiScenarioRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/scenarios/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/scenarios/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/scenarios/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/scenarios/:scenarioId",
      handler: (context) => controller.getScenario(context),
    },
    {
      method: "PUT",
      path: "/api/ai/scenarios/:scenarioId",
      handler: (context) => controller.updateScenario(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/scenarios/:scenarioId",
      handler: (context) => controller.removeScenario(context),
    },
    {
      method: "GET",
      path: "/api/ai/scenarios",
      handler: (context) => controller.listScenarios(context),
    },
    {
      method: "POST",
      path: "/api/ai/scenarios",
      handler: (context) => controller.registerScenario(context),
    },
  ];
}
