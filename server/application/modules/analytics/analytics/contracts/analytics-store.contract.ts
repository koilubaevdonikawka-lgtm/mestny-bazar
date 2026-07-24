import type {
  CustomersProjection,
  MarketplaceProjection,
  OrdersProjection,
  ProductsProjection,
  SalesProjection,
  SellersProjection,
} from "@server/application/modules/analytics/analytics/projections";

/** Analytics projection persistence contract — implemented by infrastructure adapters. */
export interface IAnalyticsStore {
  saveSalesProjection(projection: SalesProjection): Promise<void>;
  getSalesProjection(): Promise<SalesProjection | null>;
  saveOrdersProjection(projection: OrdersProjection): Promise<void>;
  getOrdersProjection(): Promise<OrdersProjection | null>;
  saveCustomersProjection(projection: CustomersProjection): Promise<void>;
  getCustomersProjection(): Promise<CustomersProjection | null>;
  saveSellersProjection(projection: SellersProjection): Promise<void>;
  getSellersProjection(): Promise<SellersProjection | null>;
  saveProductsProjection(projection: ProductsProjection): Promise<void>;
  getProductsProjection(): Promise<ProductsProjection | null>;
  saveMarketplaceProjection(projection: MarketplaceProjection): Promise<void>;
  getMarketplaceProjection(): Promise<MarketplaceProjection | null>;
  clearAllProjections(): Promise<void>;
}
