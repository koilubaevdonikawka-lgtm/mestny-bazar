import type { AiCatalogMetadataController } from "@server/api/modules/ai-catalog-metadata/ai-catalog-metadata.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiCatalogMetadataRoutes(
  controller: AiCatalogMetadataController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/catalog-metadata/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/catalog-metadata/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/catalog-metadata/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/catalog-metadata/:metadataId",
      handler: (context) => controller.getMetadata(context),
    },
    {
      method: "PUT",
      path: "/api/ai/catalog-metadata/:metadataId",
      handler: (context) => controller.updateMetadata(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/catalog-metadata/:metadataId",
      handler: (context) => controller.removeMetadata(context),
    },
    {
      method: "GET",
      path: "/api/ai/catalog-metadata",
      handler: (context) => controller.listMetadata(context),
    },
    {
      method: "POST",
      path: "/api/ai/catalog-metadata",
      handler: (context) => controller.registerMetadata(context),
    },
  ];
}
