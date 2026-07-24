import type { AiExecutionEnvironmentRegistryController } from "@server/api/modules/ai-execution-environment-registry/ai-execution-environment-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiExecutionEnvironmentRegistryRoutes(
  controller: AiExecutionEnvironmentRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/execution-environments/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/execution-environments/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/execution-environments/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/execution-environments/:executionEnvironmentId",
      handler: (context) => controller.getExecutionEnvironment(context),
    },
    {
      method: "PUT",
      path: "/api/ai/execution-environments/:executionEnvironmentId",
      handler: (context) => controller.updateExecutionEnvironment(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/execution-environments/:executionEnvironmentId",
      handler: (context) => controller.removeExecutionEnvironment(context),
    },
    {
      method: "GET",
      path: "/api/ai/execution-environments",
      handler: (context) => controller.listExecutionEnvironments(context),
    },
    {
      method: "POST",
      path: "/api/ai/execution-environments",
      handler: (context) => controller.registerExecutionEnvironment(context),
    },
  ];
}
