import type { IdempotencyManagementController } from "@server/api/modules/idempotency-management/idempotency-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createIdempotencyManagementRoutes(
  controller: IdempotencyManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/idempotency/register",
      handler: (context) => controller.register(context),
    },
    {
      method: "POST",
      path: "/api/idempotency/check",
      handler: (context) => controller.check(context),
    },
    {
      method: "POST",
      path: "/api/idempotency/store",
      handler: (context) => controller.store(context),
    },
    {
      method: "POST",
      path: "/api/idempotency/result",
      handler: (context) => controller.result(context),
    },
    {
      method: "POST",
      path: "/api/idempotency/expire",
      handler: (context) => controller.expire(context),
    },
    {
      method: "POST",
      path: "/api/idempotency/cleanup",
      handler: (context) => controller.cleanup(context),
    },
  ];
}
