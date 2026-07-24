import type { AiPromptRegistryController } from "@server/api/modules/ai-prompt-registry/ai-prompt-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiPromptRegistryRoutes(
  controller: AiPromptRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/prompts/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/prompts/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/prompts/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/prompts/:promptId",
      handler: (context) => controller.getPrompt(context),
    },
    {
      method: "PUT",
      path: "/api/ai/prompts/:promptId",
      handler: (context) => controller.updatePrompt(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/prompts/:promptId",
      handler: (context) => controller.removePrompt(context),
    },
    {
      method: "GET",
      path: "/api/ai/prompts",
      handler: (context) => controller.listPrompts(context),
    },
    {
      method: "POST",
      path: "/api/ai/prompts",
      handler: (context) => controller.registerPrompt(context),
    },
  ];
}
