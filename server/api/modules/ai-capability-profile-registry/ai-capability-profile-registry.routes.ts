import type { AiCapabilityProfileRegistryController } from "@server/api/modules/ai-capability-profile-registry/ai-capability-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiCapabilityProfileRegistryRoutes(
  controller: AiCapabilityProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/capability-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/capability-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/capability-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/capability-profiles/:capabilityProfileId",
      handler: (context) => controller.getCapabilityProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/capability-profiles/:capabilityProfileId",
      handler: (context) => controller.updateCapabilityProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/capability-profiles/:capabilityProfileId",
      handler: (context) => controller.removeCapabilityProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/capability-profiles",
      handler: (context) => controller.listCapabilityProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/capability-profiles",
      handler: (context) => controller.registerCapabilityProfile(context),
    },
  ];
}
