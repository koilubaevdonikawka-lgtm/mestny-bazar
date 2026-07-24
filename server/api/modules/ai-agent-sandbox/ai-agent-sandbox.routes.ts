import type { AiAgentSandboxController } from "@server/api/modules/ai-agent-sandbox/ai-agent-sandbox.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiAgentSandboxRoutes(
  controller: AiAgentSandboxController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/sandbox/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "POST",
      path: "/api/ai/sandbox/sessions",
      handler: (context) => controller.createSession(context),
    },
    {
      method: "GET",
      path: "/api/ai/sandbox/sessions",
      handler: (context) => controller.listSessions(context),
    },
    {
      method: "GET",
      path: "/api/ai/sandbox/:sandboxId",
      handler: (context) => controller.getSandbox(context),
    },
    {
      method: "PUT",
      path: "/api/ai/sandbox/:sandboxId",
      handler: (context) => controller.updateSandbox(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/sandbox/:sandboxId",
      handler: (context) => controller.removeSandbox(context),
    },
    {
      method: "GET",
      path: "/api/ai/sandbox",
      handler: (context) => controller.listSandboxes(context),
    },
    {
      method: "POST",
      path: "/api/ai/sandbox",
      handler: (context) => controller.registerSandbox(context),
    },
  ];
}
