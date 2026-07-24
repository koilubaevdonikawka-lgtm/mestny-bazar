import type { AiActionRegistryController } from "@server/api/modules/ai-action-registry/ai-action-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiActionRegistryRoutes(
  controller: AiActionRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/actions/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/actions/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/actions/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/actions/:actionId",
      handler: (context) => controller.getAction(context),
    },
    {
      method: "PUT",
      path: "/api/ai/actions/:actionId",
      handler: (context) => controller.updateAction(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/actions/:actionId",
      handler: (context) => controller.removeAction(context),
    },
    {
      method: "GET",
      path: "/api/ai/actions",
      handler: (context) => controller.listActions(context),
    },
    {
      method: "POST",
      path: "/api/ai/actions",
      handler: (context) => controller.registerAction(context),
    },
  ];
}
