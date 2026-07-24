import type { AiCapabilityRegistryController } from "@server/api/modules/ai-capability-registry/ai-capability-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiCapabilityRegistryRoutes(
  controller: AiCapabilityRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/capabilities/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/capabilities/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/capabilities/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/capabilities/:capabilityId",
      handler: (context) => controller.getCapability(context),
    },
    {
      method: "PUT",
      path: "/api/ai/capabilities/:capabilityId",
      handler: (context) => controller.updateCapability(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/capabilities/:capabilityId",
      handler: (context) => controller.removeCapability(context),
    },
    {
      method: "GET",
      path: "/api/ai/capabilities",
      handler: (context) => controller.listCapabilities(context),
    },
    {
      method: "POST",
      path: "/api/ai/capabilities",
      handler: (context) => controller.registerCapability(context),
    },
  ];
}
