import type { AnalyticsManagementController } from "@server/api/modules/analytics-management/analytics-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAnalyticsManagementRoutes(
  controller: AnalyticsManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/analytics/payments",
      handler: (context) => controller.payments(context),
    },
    {
      method: "GET",
      path: "/api/analytics/deliveries",
      handler: (context) => controller.deliveries(context),
    },
    {
      method: "GET",
      path: "/api/analytics/sellers",
      handler: (context) => controller.sellers(context),
    },
    {
      method: "GET",
      path: "/api/analytics/customers",
      handler: (context) => controller.customers(context),
    },
    {
      method: "GET",
      path: "/api/analytics/products",
      handler: (context) => controller.products(context),
    },
    {
      method: "GET",
      path: "/api/analytics/orders",
      handler: (context) => controller.orders(context),
    },
    {
      method: "GET",
      path: "/api/analytics/sales",
      handler: (context) => controller.sales(context),
    },
    {
      method: "GET",
      path: "/api/analytics/dashboard",
      handler: (context) => controller.dashboard(context),
    },
  ];
}
