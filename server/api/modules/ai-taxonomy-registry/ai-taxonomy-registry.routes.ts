import type { AiTaxonomyRegistryController } from "@server/api/modules/ai-taxonomy-registry/ai-taxonomy-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiTaxonomyRegistryRoutes(
  controller: AiTaxonomyRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/taxonomies/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/taxonomies/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/taxonomies/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/taxonomies/:taxonomyId",
      handler: (context) => controller.getTaxonomy(context),
    },
    {
      method: "PUT",
      path: "/api/ai/taxonomies/:taxonomyId",
      handler: (context) => controller.updateTaxonomy(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/taxonomies/:taxonomyId",
      handler: (context) => controller.removeTaxonomy(context),
    },
    {
      method: "GET",
      path: "/api/ai/taxonomies",
      handler: (context) => controller.listTaxonomies(context),
    },
    {
      method: "POST",
      path: "/api/ai/taxonomies",
      handler: (context) => controller.registerTaxonomy(context),
    },
  ];
}
