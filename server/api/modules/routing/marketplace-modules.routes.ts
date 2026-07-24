import { createCartRoutes } from "@server/api/modules/cart/cart.routes";
import { createCheckoutRoutes } from "@server/api/modules/checkout/checkout.routes";
import { createFavoritesRoutes } from "@server/api/modules/favorites/favorites.routes";
import { createReviewRoutes } from "@server/api/modules/reviews/review.routes";
import { createSearchRoutes } from "@server/api/modules/search/search.routes";
import type { CartController } from "@server/api/modules/cart";
import type { CheckoutController } from "@server/api/modules/checkout";
import type { FavoritesController } from "@server/api/modules/favorites";
import type { ReviewController } from "@server/api/modules/reviews";
import type { SearchController } from "@server/api/modules/search";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export interface MarketplaceModulesRouteDependencies {
  cart: CartController;
  checkout: CheckoutController;
  favorites: FavoritesController;
  reviews: ReviewController;
  search: SearchController;
}

/** Registers all marketplace application module API routes. */
export function createMarketplaceModulesRoutes(
  deps: MarketplaceModulesRouteDependencies,
): ApiRouteDefinition[] {
  return [
    ...createCartRoutes(deps.cart),
    ...createCheckoutRoutes(deps.checkout),
    ...createFavoritesRoutes(deps.favorites),
    ...createReviewRoutes(deps.reviews),
    ...createSearchRoutes(deps.search),
  ];
}

export {
  createJsonResponse,
  readHeader,
  readNumber,
  readQueryString,
  readRecordBody,
  readString,
  resolveAuthorId,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";
