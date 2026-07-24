import type { AiOntologyRegistryController } from "@server/api/modules/ai-ontology-registry/ai-ontology-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiOntologyRegistryRoutes(
  controller: AiOntologyRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/ontologies/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/ontologies/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/ontologies/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/ontologies/:ontologyId",
      handler: (context) => controller.getOntology(context),
    },
    {
      method: "PUT",
      path: "/api/ai/ontologies/:ontologyId",
      handler: (context) => controller.updateOntology(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/ontologies/:ontologyId",
      handler: (context) => controller.removeOntology(context),
    },
    {
      method: "GET",
      path: "/api/ai/ontologies",
      handler: (context) => controller.listOntologies(context),
    },
    {
      method: "POST",
      path: "/api/ai/ontologies",
      handler: (context) => controller.registerOntology(context),
    },
  ];
}
