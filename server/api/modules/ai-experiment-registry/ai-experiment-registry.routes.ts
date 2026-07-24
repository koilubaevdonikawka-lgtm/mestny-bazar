import type { AiExperimentRegistryController } from "@server/api/modules/ai-experiment-registry/ai-experiment-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiExperimentRegistryRoutes(
  controller: AiExperimentRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/experiments/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/experiments/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/experiments/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/experiments/:experimentId",
      handler: (context) => controller.getExperiment(context),
    },
    {
      method: "PUT",
      path: "/api/ai/experiments/:experimentId",
      handler: (context) => controller.updateExperiment(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/experiments/:experimentId",
      handler: (context) => controller.removeExperiment(context),
    },
    {
      method: "GET",
      path: "/api/ai/experiments",
      handler: (context) => controller.listExperiments(context),
    },
    {
      method: "POST",
      path: "/api/ai/experiments",
      handler: (context) => controller.registerExperiment(context),
    },
  ];
}
