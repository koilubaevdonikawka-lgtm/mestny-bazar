import type { AiTemplateRegistryController } from "@server/api/modules/ai-template-registry/ai-template-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiTemplateRegistryRoutes(
  controller: AiTemplateRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/templates/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/templates/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/templates/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/templates/:templateId",
      handler: (context) => controller.getTemplate(context),
    },
    {
      method: "PUT",
      path: "/api/ai/templates/:templateId",
      handler: (context) => controller.updateTemplate(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/templates/:templateId",
      handler: (context) => controller.removeTemplate(context),
    },
    {
      method: "GET",
      path: "/api/ai/templates",
      handler: (context) => controller.listTemplates(context),
    },
    {
      method: "POST",
      path: "/api/ai/templates",
      handler: (context) => controller.registerTemplate(context),
    },
  ];
}
