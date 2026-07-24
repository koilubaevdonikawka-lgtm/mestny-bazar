import type { AiComplianceProfileRegistryController } from "@server/api/modules/ai-compliance-profile-registry/ai-compliance-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiComplianceProfileRegistryRoutes(
  controller: AiComplianceProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/compliance-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/compliance-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/compliance-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/compliance-profiles/:complianceProfileId",
      handler: (context) => controller.getComplianceProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/compliance-profiles/:complianceProfileId",
      handler: (context) => controller.updateComplianceProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/compliance-profiles/:complianceProfileId",
      handler: (context) => controller.removeComplianceProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/compliance-profiles",
      handler: (context) => controller.listComplianceProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/compliance-profiles",
      handler: (context) => controller.registerComplianceProfile(context),
    },
  ];
}
