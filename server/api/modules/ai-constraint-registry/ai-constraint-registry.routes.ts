import type { AiConstraintRegistryController } from "@server/api/modules/ai-constraint-registry/ai-constraint-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiConstraintRegistryRoutes(
  controller: AiConstraintRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/constraints/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/constraints/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/constraints/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/constraints/:constraintId",
      handler: (context) => controller.getConstraint(context),
    },
    {
      method: "PUT",
      path: "/api/ai/constraints/:constraintId",
      handler: (context) => controller.updateConstraint(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/constraints/:constraintId",
      handler: (context) => controller.removeConstraint(context),
    },
    {
      method: "GET",
      path: "/api/ai/constraints",
      handler: (context) => controller.listConstraints(context),
    },
    {
      method: "POST",
      path: "/api/ai/constraints",
      handler: (context) => controller.registerConstraint(context),
    },
  ];
}
