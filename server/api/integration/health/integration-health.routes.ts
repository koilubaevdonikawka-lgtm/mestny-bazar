import type { IntegrationHealthController } from "@server/api/integration/health/integration-health.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createIntegrationHealthRoutes(
  controller: IntegrationHealthController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/health",
      handler: (context) => controller.getHealth(context),
    },
    {
      method: "GET",
      path: "/api/health",
      handler: (context) => controller.getHealth(context),
    },
  ];
}
