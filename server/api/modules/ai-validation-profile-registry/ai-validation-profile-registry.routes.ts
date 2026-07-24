import type { AiValidationProfileRegistryController } from "@server/api/modules/ai-validation-profile-registry/ai-validation-profile-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiValidationProfileRegistryRoutes(
  controller: AiValidationProfileRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/validation-profiles/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/validation-profiles/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/validation-profiles/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/validation-profiles/:validationProfileId",
      handler: (context) => controller.getValidationProfile(context),
    },
    {
      method: "PUT",
      path: "/api/ai/validation-profiles/:validationProfileId",
      handler: (context) => controller.updateValidationProfile(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/validation-profiles/:validationProfileId",
      handler: (context) => controller.removeValidationProfile(context),
    },
    {
      method: "GET",
      path: "/api/ai/validation-profiles",
      handler: (context) => controller.listValidationProfiles(context),
    },
    {
      method: "POST",
      path: "/api/ai/validation-profiles",
      handler: (context) => controller.registerValidationProfile(context),
    },
  ];
}
