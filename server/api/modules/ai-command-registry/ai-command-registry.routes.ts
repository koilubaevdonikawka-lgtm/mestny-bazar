import type { AiCommandRegistryController } from "@server/api/modules/ai-command-registry/ai-command-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiCommandRegistryRoutes(
  controller: AiCommandRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/commands/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/commands/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/commands/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/commands/:commandId",
      handler: (context) => controller.getCommand(context),
    },
    {
      method: "PUT",
      path: "/api/ai/commands/:commandId",
      handler: (context) => controller.updateCommand(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/commands/:commandId",
      handler: (context) => controller.removeCommand(context),
    },
    {
      method: "GET",
      path: "/api/ai/commands",
      handler: (context) => controller.listCommands(context),
    },
    {
      method: "POST",
      path: "/api/ai/commands",
      handler: (context) => controller.registerCommand(context),
    },
  ];
}
