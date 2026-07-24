import type { McpServerController } from "@server/api/modules/mcp-server/mcp-server.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createMcpServerRoutes(controller: McpServerController): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/mcp/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/mcp/history",
      handler: (context) => controller.history(context),
    },
    {
      method: "POST",
      path: "/api/mcp/request",
      handler: (context) => controller.handleRequest(context),
    },
    {
      method: "GET",
      path: "/api/mcp/tools/:toolId",
      handler: (context) => controller.getTool(context),
    },
    {
      method: "GET",
      path: "/api/mcp/tools",
      handler: (context) => controller.listTools(context),
    },
    {
      method: "POST",
      path: "/api/mcp/tools",
      handler: (context) => controller.registerTool(context),
    },
    {
      method: "GET",
      path: "/api/mcp/resources",
      handler: (context) => controller.listResources(context),
    },
    {
      method: "POST",
      path: "/api/mcp/resources",
      handler: (context) => controller.registerResource(context),
    },
  ];
}
