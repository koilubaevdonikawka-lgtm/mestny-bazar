import {
  CatalogController,
  OrderController,
  ProductController,
  SellerController,
} from "@server/api/controllers";
import { createCatalogRoutes } from "@server/api/routes/catalog.routes";
import { createOrderRoutes } from "@server/api/routes/order.routes";
import { createProductRoutes } from "@server/api/routes/product.routes";
import { createSellerRoutes } from "@server/api/routes/seller.routes";
import type { ApiRouteDefinition } from "@server/api/server/api.types";
import type { CatalogApplicationService } from "@server/application/services/catalog-application.service";
import type { OrderApplicationService } from "@server/application/services/order-application.service";
import type { ProductApplicationService } from "@server/application/services/product-application.service";
import type { SellerApplicationService } from "@server/application/services/seller-application.service";

export interface ApiRouteDependencies {
  products: ProductApplicationService;
  sellers: SellerApplicationService;
  catalogs: CatalogApplicationService;
  orders: OrderApplicationService;
}

/** Registers all marketplace API routes. */
export function createApiRoutes(deps: ApiRouteDependencies): ApiRouteDefinition[] {
  const productController = new ProductController(deps.products);
  const sellerController = new SellerController(deps.sellers);
  const catalogController = new CatalogController(deps.catalogs);
  const orderController = new OrderController(deps.orders);

  return Object.freeze([
    ...createProductRoutes(productController),
    ...createSellerRoutes(sellerController),
    ...createCatalogRoutes(catalogController),
    ...createOrderRoutes(orderController),
  ]);
}
