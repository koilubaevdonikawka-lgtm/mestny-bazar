import type { AiMemoryManagementController } from "@server/api/modules/ai-memory-management/ai-memory-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiMemoryManagementRoutes(
  controller: AiMemoryManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/memory/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/memory/key/:key",
      handler: (context) => controller.findByKey(context),
    },
    {
      method: "GET",
      path: "/api/ai/memory/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/memory/:memoryId",
      handler: (context) => controller.getRecord(context),
    },
    {
      method: "PUT",
      path: "/api/ai/memory/:memoryId",
      handler: (context) => controller.updateRecord(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/memory/:memoryId",
      handler: (context) => controller.removeRecord(context),
    },
    {
      method: "GET",
      path: "/api/ai/memory",
      handler: (context) => controller.listRecords(context),
    },
    {
      method: "POST",
      path: "/api/ai/memory",
      handler: (context) => controller.registerRecord(context),
    },
  ];
}
