import type { AiSessionManagementController } from "@server/api/modules/ai-session-management/ai-session-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiSessionManagementRoutes(
  controller: AiSessionManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/sessions/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/sessions/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/sessions/status/:status",
      handler: (context) => controller.listByStatus(context),
    },
    {
      method: "GET",
      path: "/api/ai/sessions/:sessionId",
      handler: (context) => controller.getSession(context),
    },
    {
      method: "PUT",
      path: "/api/ai/sessions/:sessionId",
      handler: (context) => controller.updateSession(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/sessions/:sessionId",
      handler: (context) => controller.closeSession(context),
    },
    {
      method: "GET",
      path: "/api/ai/sessions",
      handler: (context) => controller.listSessions(context),
    },
    {
      method: "POST",
      path: "/api/ai/sessions",
      handler: (context) => controller.createSession(context),
    },
  ];
}
