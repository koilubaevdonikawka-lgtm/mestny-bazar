import type { AiPrivacyProfileRegistryController } from "@server/api/modules/ai-privacy-profile-registry/ai-privacy-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiPrivacyProfileRegistryRoutes(
  controller: AiPrivacyProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/privacy-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/privacy-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/privacy-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/privacy-profiles/:privacyProfileId",
      handler: (context) => controller.getPrivacyProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/privacy-profiles/:privacyProfileId",
      handler: (context) => controller.updatePrivacyProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/privacy-profiles/:privacyProfileId",
      handler: (context) => controller.removePrivacyProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/privacy-profiles",
      handler: (context) => controller.listPrivacyProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/privacy-profiles",
      handler: (context) => controller.registerPrivacyProfile(context),
    },
  ];
}
