import type { AiAgentMonitoringController } from "@server/api/modules/ai-agent-monitoring/ai-agent-monitoring.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiAgentMonitoringRoutes(
  controller: AiAgentMonitoringController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/monitoring/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/monitoring/metrics",
      handler: (context) => controller.metrics(context),
    },
    {
      method: "GET",
      path: "/api/ai/monitoring/activity",
      handler: (context) => controller.activityHistory(context),
    },
    {
      method: "POST",
      path: "/api/ai/monitoring/status",
      handler: (context) => controller.registerStatus(context),
    },
    {
      method: "GET",
      path: "/api/ai/monitoring/status",
      handler: (context) => controller.listStatuses(context),
    },
    {
      method: "GET",
      path: "/api/ai/monitoring/events/:eventId",
      handler: (context) => controller.getEvent(context),
    },
    {
      method: "GET",
      path: "/api/ai/monitoring/events",
      handler: (context) => controller.listEvents(context),
    },
    {
      method: "POST",
      path: "/api/ai/monitoring/events",
      handler: (context) => controller.registerEvent(context),
    },
  ];
}
