import type { AiRelationRegistryController } from "@server/api/modules/ai-relation-registry/ai-relation-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiRelationRegistryRoutes(
  controller: AiRelationRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/relations/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/relations/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/relations/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/relations/:relationId",
      handler: (context) => controller.getRelation(context),
    },
    {
      method: "PUT",
      path: "/api/ai/relations/:relationId",
      handler: (context) => controller.updateRelation(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/relations/:relationId",
      handler: (context) => controller.removeRelation(context),
    },
    {
      method: "GET",
      path: "/api/ai/relations",
      handler: (context) => controller.listRelations(context),
    },
    {
      method: "POST",
      path: "/api/ai/relations",
      handler: (context) => controller.registerRelation(context),
    },
  ];
}
