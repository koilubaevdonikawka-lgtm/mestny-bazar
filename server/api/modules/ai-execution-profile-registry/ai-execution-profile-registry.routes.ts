import type { AiExecutionProfileRegistryController } from "@server/api/modules/ai-execution-profile-registry/ai-execution-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiExecutionProfileRegistryRoutes(
  controller: AiExecutionProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/execution-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/execution-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/execution-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/execution-profiles/:executionProfileId",
      handler: (context) => controller.getExecutionProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/execution-profiles/:executionProfileId",
      handler: (context) => controller.updateExecutionProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/execution-profiles/:executionProfileId",
      handler: (context) => controller.removeExecutionProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/execution-profiles",
      handler: (context) => controller.listExecutionProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/execution-profiles",
      handler: (context) => controller.registerExecutionProfile(context),
    },
  ];
}
