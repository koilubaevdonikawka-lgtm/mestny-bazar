import type { SellerProductController } from "@server/api/modules/seller-product/seller-product.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createSellerProductRoutes(
  controller: SellerProductController,
): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/seller/products",
      handler: (context) => controller.create(context),
    },
    {
      method: "GET",
      path: "/api/seller/products",
      handler: (context) => controller.list(context),
    },
    {
      method: "PUT",
      path: "/api/seller/products/:id",
      handler: (context) => controller.update(context),
    },
    {
      method: "DELETE",
      path: "/api/seller/products/:id",
      handler: (context) => controller.deleteProduct(context),
    },
    {
      method: "POST",
      path: "/api/seller/products/:id/images",
      handler: (context) => controller.uploadImages(context),
    },
    {
      method: "PATCH",
      path: "/api/seller/products/:id/price",
      handler: (context) => controller.changePrice(context),
    },
    {
      method: "PATCH",
      path: "/api/seller/products/:id/inventory",
      handler: (context) => controller.changeInventory(context),
    },
    {
      method: "POST",
      path: "/api/seller/products/:id/submit",
      handler: (context) => controller.submit(context),
    },
    {
      method: "POST",
      path: "/api/moderation/products/:id/approve",
      handler: (context) => controller.approve(context),
    },
    {
      method: "POST",
      path: "/api/moderation/products/:id/reject",
      handler: (context) => controller.reject(context),
    },
    {
      method: "POST",
      path: "/api/seller/products/:id/publish",
      handler: (context) => controller.publish(context),
    },
    {
      method: "POST",
      path: "/api/seller/products/:id/unpublish",
      handler: (context) => controller.unpublish(context),
    },
    {
      method: "POST",
      path: "/api/seller/products/:id/archive",
      handler: (context) => controller.archive(context),
    },
  ];
}
