import type { AiGraphRegistryController } from "@server/api/modules/ai-graph-registry/ai-graph-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiGraphRegistryRoutes(
  controller: AiGraphRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/graphs/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/graphs/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/graphs/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/graphs/:graphId",
      handler: (context) => controller.getGraph(context),
    },
    {
      method: "PUT",
      path: "/api/ai/graphs/:graphId",
      handler: (context) => controller.updateGraph(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/graphs/:graphId",
      handler: (context) => controller.removeGraph(context),
    },
    {
      method: "GET",
      path: "/api/ai/graphs",
      handler: (context) => controller.listGraphs(context),
    },
    {
      method: "POST",
      path: "/api/ai/graphs",
      handler: (context) => controller.registerGraph(context),
    },
  ];
}
