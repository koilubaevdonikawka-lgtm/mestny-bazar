import type { AiKnowledgeRegistryController } from "@server/api/modules/ai-knowledge-registry/ai-knowledge-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiKnowledgeRegistryRoutes(
  controller: AiKnowledgeRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/knowledge/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge/:knowledgeId",
      handler: (context) => controller.getSource(context),
    },
    {
      method: "PUT",
      path: "/api/ai/knowledge/:knowledgeId",
      handler: (context) => controller.updateSource(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/knowledge/:knowledgeId",
      handler: (context) => controller.removeSource(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge",
      handler: (context) => controller.listSources(context),
    },
    {
      method: "POST",
      path: "/api/ai/knowledge",
      handler: (context) => controller.registerSource(context),
    },
  ];
}
