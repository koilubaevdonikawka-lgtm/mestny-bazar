import type { AiKnowledgeSourceRegistryController } from "@server/api/modules/ai-knowledge-source-registry/ai-knowledge-source-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiKnowledgeSourceRegistryRoutes(
  controller: AiKnowledgeSourceRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/knowledge-sources/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-sources/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-sources/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-sources/:knowledgeSourceId",
      handler: (context) => controller.getKnowledgeSource(context),
    },
    {
      method: "PUT",
      path: "/api/ai/knowledge-sources/:knowledgeSourceId",
      handler: (context) => controller.updateKnowledgeSource(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/knowledge-sources/:knowledgeSourceId",
      handler: (context) => controller.removeKnowledgeSource(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-sources",
      handler: (context) => controller.listKnowledgeSources(context),
    },
    {
      method: "POST",
      path: "/api/ai/knowledge-sources",
      handler: (context) => controller.registerKnowledgeSource(context),
    },
  ];
}
