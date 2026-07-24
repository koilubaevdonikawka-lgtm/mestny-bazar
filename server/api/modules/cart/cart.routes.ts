import type { CartController } from "@server/api/modules/cart/cart.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createCartRoutes(controller: CartController): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/cart",
      handler: (context) => controller.getCart(context),
    },
    {
      method: "POST",
      path: "/api/cart/items",
      handler: (context) => controller.addItem(context),
    },
    {
      method: "PATCH",
      path: "/api/cart/items/:id",
      handler: (context) => controller.changeQuantity(context),
    },
    {
      method: "DELETE",
      path: "/api/cart/items/:id",
      handler: (context) => controller.removeItem(context),
    },
    {
      method: "DELETE",
      path: "/api/cart",
      handler: (context) => controller.clearCart(context),
    },
  ];
}
