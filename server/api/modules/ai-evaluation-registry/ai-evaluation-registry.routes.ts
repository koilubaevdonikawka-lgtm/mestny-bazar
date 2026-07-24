import type { AiEvaluationRegistryController } from "@server/api/modules/ai-evaluation-registry/ai-evaluation-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiEvaluationRegistryRoutes(
  controller: AiEvaluationRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/evaluations/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/evaluations/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/evaluations/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/evaluations/:evaluationId",
      handler: (context) => controller.getEvaluation(context),
    },
    {
      method: "PUT",
      path: "/api/ai/evaluations/:evaluationId",
      handler: (context) => controller.updateEvaluation(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/evaluations/:evaluationId",
      handler: (context) => controller.removeEvaluation(context),
    },
    {
      method: "GET",
      path: "/api/ai/evaluations",
      handler: (context) => controller.listEvaluations(context),
    },
    {
      method: "POST",
      path: "/api/ai/evaluations",
      handler: (context) => controller.registerEvaluation(context),
    },
  ];
}
