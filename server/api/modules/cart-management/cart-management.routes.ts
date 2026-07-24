import type { CartManagementController } from "@server/api/modules/cart-management/cart-management.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createCartManagementRoutes(
  controller: CartManagementController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/cart/total",
      handler: (context) => controller.calculateTotal(context),
    },
    {
      method: "POST",
      path: "/api/cart/validate",
      handler: (context) => controller.validate(context),
    },
    {
      method: "POST",
      path: "/api/cart/items",
      handler: (context) => controller.addItem(context),
    },
    {
      method: "PATCH",
      path: "/api/cart/items/:productId",
      handler: (context) => controller.updateQuantity(context),
    },
    {
      method: "DELETE",
      path: "/api/cart/items/:productId",
      handler: (context) => controller.removeItem(context),
    },
    {
      method: "GET",
      path: "/api/cart",
      handler: (context) => controller.getCart(context),
    },
    {
      method: "DELETE",
      path: "/api/cart",
      handler: (context) => controller.clear(context),
    },
  ];
}
