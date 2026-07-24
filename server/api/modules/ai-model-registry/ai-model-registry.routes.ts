import type { AiModelRegistryController } from "@server/api/modules/ai-model-registry/ai-model-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiModelRegistryRoutes(
  controller: AiModelRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/models/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/models/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/models/provider/:provider",
      handler: (context) => controller.listByProvider(context),
    },
    {
      method: "GET",
      path: "/api/ai/models/:modelId",
      handler: (context) => controller.getModel(context),
    },
    {
      method: "PUT",
      path: "/api/ai/models/:modelId",
      handler: (context) => controller.updateModel(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/models/:modelId",
      handler: (context) => controller.removeModel(context),
    },
    {
      method: "GET",
      path: "/api/ai/models",
      handler: (context) => controller.listModels(context),
    },
    {
      method: "POST",
      path: "/api/ai/models",
      handler: (context) => controller.registerModel(context),
    },
  ];
}
