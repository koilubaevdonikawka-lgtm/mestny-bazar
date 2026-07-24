import type { AiWorkflowTemplateRegistryController } from "@server/api/modules/ai-workflow-template-registry/ai-workflow-template-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiWorkflowTemplateRegistryRoutes(
  controller: AiWorkflowTemplateRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/workflow-templates/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/workflow-templates/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/workflow-templates/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/workflow-templates/:workflowTemplateId",
      handler: (context) => controller.getWorkflowTemplate(context),
    },
    {
      method: "PUT",
      path: "/api/ai/workflow-templates/:workflowTemplateId",
      handler: (context) => controller.updateWorkflowTemplate(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/workflow-templates/:workflowTemplateId",
      handler: (context) => controller.removeWorkflowTemplate(context),
    },
    {
      method: "GET",
      path: "/api/ai/workflow-templates",
      handler: (context) => controller.listWorkflowTemplates(context),
    },
    {
      method: "POST",
      path: "/api/ai/workflow-templates",
      handler: (context) => controller.registerWorkflowTemplate(context),
    },
  ];
}
