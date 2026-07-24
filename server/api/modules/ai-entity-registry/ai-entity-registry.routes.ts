import type { AiEntityRegistryController } from "@server/api/modules/ai-entity-registry/ai-entity-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiEntityRegistryRoutes(
  controller: AiEntityRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/entities/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/entities/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/entities/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/entities/:entityId",
      handler: (context) => controller.getEntity(context),
    },
    {
      method: "PUT",
      path: "/api/ai/entities/:entityId",
      handler: (context) => controller.updateEntity(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/entities/:entityId",
      handler: (context) => controller.removeEntity(context),
    },
    {
      method: "GET",
      path: "/api/ai/entities",
      handler: (context) => controller.listEntities(context),
    },
    {
      method: "POST",
      path: "/api/ai/entities",
      handler: (context) => controller.registerEntity(context),
    },
  ];
}
