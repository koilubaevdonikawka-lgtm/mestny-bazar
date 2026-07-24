import type { AiConversationManagementController } from "@server/api/modules/ai-conversation-management/ai-conversation-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiConversationManagementRoutes(
  controller: AiConversationManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/conversations/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/conversations/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/conversations/status/:status",
      handler: (context) => controller.listByStatus(context),
    },
    {
      method: "GET",
      path: "/api/ai/conversations/:conversationId",
      handler: (context) => controller.getConversation(context),
    },
    {
      method: "PUT",
      path: "/api/ai/conversations/:conversationId",
      handler: (context) => controller.updateConversation(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/conversations/:conversationId",
      handler: (context) => controller.closeConversation(context),
    },
    {
      method: "GET",
      path: "/api/ai/conversations",
      handler: (context) => controller.listConversations(context),
    },
    {
      method: "POST",
      path: "/api/ai/conversations",
      handler: (context) => controller.createConversation(context),
    },
  ];
}
