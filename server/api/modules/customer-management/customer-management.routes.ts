import type { CustomerManagementController } from "@server/api/modules/customer-management/customer-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createCustomerManagementRoutes(
  controller: CustomerManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/customers/register",
      handler: (context) => controller.register(context),
    },
    {
      method: "POST",
      path: "/api/customers/verify-phone",
      handler: (context) => controller.verifyPhone(context),
    },
    {
      method: "GET",
      path: "/api/customers/profile",
      handler: (context) => controller.getProfile(context),
    },
    {
      method: "PUT",
      path: "/api/customers/profile",
      handler: (context) => controller.updateProfile(context),
    },
    {
      method: "GET",
      path: "/api/customers/addresses",
      handler: (context) => controller.listAddresses(context),
    },
    {
      method: "POST",
      path: "/api/customers/addresses",
      handler: (context) => controller.addAddress(context),
    },
    {
      method: "PUT",
      path: "/api/customers/addresses/:id",
      handler: (context) => controller.updateAddress(context),
    },
    {
      method: "DELETE",
      path: "/api/customers/addresses/:id",
      handler: (context) => controller.deleteAddress(context),
    },
    {
      method: "POST",
      path: "/api/customers/addresses/:id/default",
      handler: (context) => controller.setDefaultAddress(context),
    },
    {
      method: "PUT",
      path: "/api/customers/notification-settings",
      handler: (context) => controller.updateNotificationSettings(context),
    },
    {
      method: "GET",
      path: "/api/customers/orders",
      handler: (context) => controller.orderHistory(context),
    },
    {
      method: "POST",
      path: "/api/customers/deactivate",
      handler: (context) => controller.deactivate(context),
    },
  ];
}
