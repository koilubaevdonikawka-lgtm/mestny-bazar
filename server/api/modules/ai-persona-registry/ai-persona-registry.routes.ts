import type { AiPersonaRegistryController } from "@server/api/modules/ai-persona-registry/ai-persona-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiPersonaRegistryRoutes(
  controller: AiPersonaRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/personas/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/personas/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/personas/type/:type",
      handler: (context) => controller.listByType(context),
    },
    {
      method: "GET",
      path: "/api/ai/personas/:personaId",
      handler: (context) => controller.getPersona(context),
    },
    {
      method: "PUT",
      path: "/api/ai/personas/:personaId",
      handler: (context) => controller.updatePersona(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/personas/:personaId",
      handler: (context) => controller.removePersona(context),
    },
    {
      method: "GET",
      path: "/api/ai/personas",
      handler: (context) => controller.listPersonas(context),
    },
    {
      method: "POST",
      path: "/api/ai/personas",
      handler: (context) => controller.registerPersona(context),
    },
  ];
}
