import type { AiSecurityProfileRegistryController } from "@server/api/modules/ai-security-profile-registry/ai-security-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiSecurityProfileRegistryRoutes(
  controller: AiSecurityProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/security-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/security-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/security-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/security-profiles/:securityProfileId",
      handler: (context) => controller.getSecurityProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/security-profiles/:securityProfileId",
      handler: (context) => controller.updateSecurityProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/security-profiles/:securityProfileId",
      handler: (context) => controller.removeSecurityProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/security-profiles",
      handler: (context) => controller.listSecurityProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/security-profiles",
      handler: (context) => controller.registerSecurityProfile(context),
    },
  ];
}
