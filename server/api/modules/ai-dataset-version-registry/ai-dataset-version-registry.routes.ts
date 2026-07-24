import type { AiDatasetVersionRegistryController } from "@server/api/modules/ai-dataset-version-registry/ai-dataset-version-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiDatasetVersionRegistryRoutes(
  controller: AiDatasetVersionRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/dataset-versions/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/dataset-versions/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/dataset-versions/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/dataset-versions/:datasetVersionId",
      handler: (context) => controller.getDatasetVersion(context),
    },
    {
      method: "PUT",
      path: "/api/ai/dataset-versions/:datasetVersionId",
      handler: (context) => controller.updateDatasetVersion(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/dataset-versions/:datasetVersionId",
      handler: (context) => controller.removeDatasetVersion(context),
    },
    {
      method: "GET",
      path: "/api/ai/dataset-versions",
      handler: (context) => controller.listDatasetVersions(context),
    },
    {
      method: "POST",
      path: "/api/ai/dataset-versions",
      handler: (context) => controller.registerDatasetVersion(context),
    },
  ];
}
