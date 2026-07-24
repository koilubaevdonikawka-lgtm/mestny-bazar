import type { AiKnowledgeGraphRegistryController } from "@server/api/modules/ai-knowledge-graph-registry/ai-knowledge-graph-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiKnowledgeGraphRegistryRoutes(
  controller: AiKnowledgeGraphRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/knowledge-graphs/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-graphs/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-graphs/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-graphs/:knowledgeGraphId",
      handler: (context) => controller.getKnowledgeGraph(context),
    },
    {
      method: "PUT",
      path: "/api/ai/knowledge-graphs/:knowledgeGraphId",
      handler: (context) => controller.updateKnowledgeGraph(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/knowledge-graphs/:knowledgeGraphId",
      handler: (context) => controller.removeKnowledgeGraph(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-graphs",
      handler: (context) => controller.listKnowledgeGraphs(context),
    },
    {
      method: "POST",
      path: "/api/ai/knowledge-graphs",
      handler: (context) => controller.registerKnowledgeGraph(context),
    },
  ];
}
