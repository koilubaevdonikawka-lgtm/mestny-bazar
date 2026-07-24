import type { AiSchemaRegistryController } from "@server/api/modules/ai-schema-registry/ai-schema-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiSchemaRegistryRoutes(
  controller: AiSchemaRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/schemas/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/schemas/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/schemas/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/schemas/:schemaId",
      handler: (context) => controller.getSchema(context),
    },
    {
      method: "PUT",
      path: "/api/ai/schemas/:schemaId",
      handler: (context) => controller.updateSchema(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/schemas/:schemaId",
      handler: (context) => controller.removeSchema(context),
    },
    {
      method: "GET",
      path: "/api/ai/schemas",
      handler: (context) => controller.listSchemas(context),
    },
    {
      method: "POST",
      path: "/api/ai/schemas",
      handler: (context) => controller.registerSchema(context),
    },
  ];
}
