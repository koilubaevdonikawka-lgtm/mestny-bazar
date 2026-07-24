import type { AiBenchmarkRegistryController } from "@server/api/modules/ai-benchmark-registry/ai-benchmark-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiBenchmarkRegistryRoutes(
  controller: AiBenchmarkRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/benchmarks/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/benchmarks/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/benchmarks/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/benchmarks/:benchmarkId",
      handler: (context) => controller.getBenchmark(context),
    },
    {
      method: "PUT",
      path: "/api/ai/benchmarks/:benchmarkId",
      handler: (context) => controller.updateBenchmark(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/benchmarks/:benchmarkId",
      handler: (context) => controller.removeBenchmark(context),
    },
    {
      method: "GET",
      path: "/api/ai/benchmarks",
      handler: (context) => controller.listBenchmarks(context),
    },
    {
      method: "POST",
      path: "/api/ai/benchmarks",
      handler: (context) => controller.registerBenchmark(context),
    },
  ];
}
