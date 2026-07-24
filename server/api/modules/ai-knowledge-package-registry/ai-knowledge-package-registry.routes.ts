import type { AiKnowledgePackageRegistryController } from "@server/api/modules/ai-knowledge-package-registry/ai-knowledge-package-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiKnowledgePackageRegistryRoutes(
  controller: AiKnowledgePackageRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/knowledge-packages/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-packages/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-packages/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-packages/:knowledgePackageId",
      handler: (context) => controller.getKnowledgePackage(context),
    },
    {
      method: "PUT",
      path: "/api/ai/knowledge-packages/:knowledgePackageId",
      handler: (context) => controller.updateKnowledgePackage(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/knowledge-packages/:knowledgePackageId",
      handler: (context) => controller.removeKnowledgePackage(context),
    },
    {
      method: "GET",
      path: "/api/ai/knowledge-packages",
      handler: (context) => controller.listKnowledgePackages(context),
    },
    {
      method: "POST",
      path: "/api/ai/knowledge-packages",
      handler: (context) => controller.registerKnowledgePackage(context),
    },
  ];
}
