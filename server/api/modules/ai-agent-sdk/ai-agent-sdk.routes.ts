import type { AiAgentSdkController } from "@server/api/modules/ai-agent-sdk/ai-agent-sdk.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiAgentSdkRoutes(controller: AiAgentSdkController): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/sdk/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "POST",
      path: "/api/ai/sdk/instances",
      handler: (context) => controller.createInstance(context),
    },
    {
      method: "GET",
      path: "/api/ai/sdk/instances",
      handler: (context) => controller.listInstances(context),
    },
    {
      method: "GET",
      path: "/api/ai/sdk/:sdkId",
      handler: (context) => controller.getSdk(context),
    },
    {
      method: "PUT",
      path: "/api/ai/sdk/:sdkId",
      handler: (context) => controller.updateSdk(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/sdk/:sdkId",
      handler: (context) => controller.removeSdk(context),
    },
    {
      method: "GET",
      path: "/api/ai/sdk",
      handler: (context) => controller.listSdks(context),
    },
    {
      method: "POST",
      path: "/api/ai/sdk",
      handler: (context) => controller.registerSdk(context),
    },
  ];
}
