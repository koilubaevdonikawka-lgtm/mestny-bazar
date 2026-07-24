import type { ReviewController } from "@server/api/modules/reviews/review.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createReviewRoutes(controller: ReviewController): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/products/:productId/reviews",
      handler: (context) => controller.listByProduct(context),
    },
    {
      method: "POST",
      path: "/api/products/:productId/reviews",
      handler: (context) => controller.create(context),
    },
    {
      method: "PATCH",
      path: "/api/reviews/:reviewId",
      handler: (context) => controller.edit(context),
    },
    {
      method: "DELETE",
      path: "/api/reviews/:reviewId",
      handler: (context) => controller.remove(context),
    },
  ];
}
