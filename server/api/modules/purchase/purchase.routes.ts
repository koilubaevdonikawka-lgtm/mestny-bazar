import type { PurchaseController } from "@server/api/modules/purchase/purchase.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createPurchaseRoutes(controller: PurchaseController): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/purchase/catalog",
      handler: (context) => controller.browseCatalog(context),
    },
    {
      method: "GET",
      path: "/api/purchase/products/:id",
      handler: (context) => controller.viewProduct(context),
    },
    {
      method: "POST",
      path: "/api/purchase/cart/items",
      handler: (context) => controller.addToCart(context),
    },
    {
      method: "PATCH",
      path: "/api/purchase/cart/items/:id",
      handler: (context) => controller.updateCart(context),
    },
    {
      method: "POST",
      path: "/api/purchase/checkout",
      handler: (context) => controller.checkout(context),
    },
    {
      method: "POST",
      path: "/api/purchase/checkout/:id/order",
      handler: (context) => controller.createOrder(context),
    },
    {
      method: "POST",
      path: "/api/purchase/payments/:id/pay",
      handler: (context) => controller.payOrder(context),
    },
    {
      method: "POST",
      path: "/api/purchase/checkout/:id/complete",
      handler: (context) => controller.completePurchase(context),
    },
    {
      method: "POST",
      path: "/api/purchase/orders/:id/notify-warehouse",
      handler: (context) => controller.notifyWarehouse(context),
    },
    {
      method: "POST",
      path: "/api/purchase/orders/:id/notify-courier",
      handler: (context) => controller.notifyCourier(context),
    },
  ];
}
