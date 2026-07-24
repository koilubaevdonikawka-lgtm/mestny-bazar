import type { AiWorkflowRegistryController } from "@server/api/modules/ai-workflow-registry/ai-workflow-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiWorkflowRegistryRoutes(
  controller: AiWorkflowRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/workflows/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/workflows/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/workflows/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/workflows/:workflowId",
      handler: (context) => controller.getWorkflow(context),
    },
    {
      method: "PUT",
      path: "/api/ai/workflows/:workflowId",
      handler: (context) => controller.updateWorkflow(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/workflows/:workflowId",
      handler: (context) => controller.removeWorkflow(context),
    },
    {
      method: "GET",
      path: "/api/ai/workflows",
      handler: (context) => controller.listWorkflows(context),
    },
    {
      method: "POST",
      path: "/api/ai/workflows",
      handler: (context) => controller.registerWorkflow(context),
    },
  ];
}
