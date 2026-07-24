import type { AiConceptRegistryController } from "@server/api/modules/ai-concept-registry/ai-concept-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiConceptRegistryRoutes(
  controller: AiConceptRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/concepts/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/concepts/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/concepts/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/concepts/:conceptId",
      handler: (context) => controller.getConcept(context),
    },
    {
      method: "PUT",
      path: "/api/ai/concepts/:conceptId",
      handler: (context) => controller.updateConcept(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/concepts/:conceptId",
      handler: (context) => controller.removeConcept(context),
    },
    {
      method: "GET",
      path: "/api/ai/concepts",
      handler: (context) => controller.listConcepts(context),
    },
    {
      method: "POST",
      path: "/api/ai/concepts",
      handler: (context) => controller.registerConcept(context),
    },
  ];
}
