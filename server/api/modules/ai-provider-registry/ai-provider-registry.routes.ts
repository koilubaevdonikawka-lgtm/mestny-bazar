import type { AiProviderRegistryController } from "@server/api/modules/ai-provider-registry/ai-provider-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiProviderRegistryRoutes(
  controller: AiProviderRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/providers/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/providers/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/providers/type/:type",
      handler: (context) => controller.listByType(context),
    },
    {
      method: "GET",
      path: "/api/ai/providers/:providerId",
      handler: (context) => controller.getProvider(context),
    },
    {
      method: "PUT",
      path: "/api/ai/providers/:providerId",
      handler: (context) => controller.updateProvider(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/providers/:providerId",
      handler: (context) => controller.removeProvider(context),
    },
    {
      method: "GET",
      path: "/api/ai/providers",
      handler: (context) => controller.listProviders(context),
    },
    {
      method: "POST",
      path: "/api/ai/providers",
      handler: (context) => controller.registerProvider(context),
    },
  ];
}
