import type { AiDatasetRegistryController } from "@server/api/modules/ai-dataset-registry/ai-dataset-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiDatasetRegistryRoutes(
  controller: AiDatasetRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/datasets/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/datasets/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/datasets/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/datasets/:datasetId",
      handler: (context) => controller.getDataset(context),
    },
    {
      method: "PUT",
      path: "/api/ai/datasets/:datasetId",
      handler: (context) => controller.updateDataset(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/datasets/:datasetId",
      handler: (context) => controller.removeDataset(context),
    },
    {
      method: "GET",
      path: "/api/ai/datasets",
      handler: (context) => controller.listDatasets(context),
    },
    {
      method: "POST",
      path: "/api/ai/datasets",
      handler: (context) => controller.registerDataset(context),
    },
  ];
}
