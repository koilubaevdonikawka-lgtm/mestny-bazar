import type { AiCapabilityDiscoveryController } from "@server/api/modules/ai-capability-discovery/ai-capability-discovery.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiCapabilityDiscoveryRoutes(
  controller: AiCapabilityDiscoveryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/capabilities/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/capabilities/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/capabilities/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/capabilities/:capabilityId",
      handler: (context) => controller.get(context),
    },
    {
      method: "PUT",
      path: "/api/ai/capabilities/:capabilityId",
      handler: (context) => controller.update(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/capabilities/:capabilityId",
      handler: (context) => controller.remove(context),
    },
    {
      method: "GET",
      path: "/api/ai/capabilities",
      handler: (context) => controller.list(context),
    },
    {
      method: "POST",
      path: "/api/ai/capabilities",
      handler: (context) => controller.register(context),
    },
  ];
}
