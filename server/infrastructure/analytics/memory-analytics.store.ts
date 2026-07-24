import type { IAnalyticsStore } from "@server/application/modules/analytics/analytics/contracts";
import type {
  CustomersProjection,
  MarketplaceProjection,
  OrdersProjection,
  ProductsProjection,
  SalesProjection,
  SellersProjection,
} from "@server/application/modules/analytics/analytics/projections";

/** In-memory analytics store for development and tests. */
export class MemoryAnalyticsStore implements IAnalyticsStore {
  private sales: SalesProjection | null = null;
  private orders: OrdersProjection | null = null;
  private customers: CustomersProjection | null = null;
  private sellers: SellersProjection | null = null;
  private products: ProductsProjection | null = null;
  private marketplace: MarketplaceProjection | null = null;

  async saveSalesProjection(projection: SalesProjection): Promise<void> {
    this.sales = projection;
  }

  async getSalesProjection(): Promise<SalesProjection | null> {
    return this.sales;
  }

  async saveOrdersProjection(projection: OrdersProjection): Promise<void> {
    this.orders = projection;
  }

  async getOrdersProjection(): Promise<OrdersProjection | null> {
    return this.orders;
  }

  async saveCustomersProjection(projection: CustomersProjection): Promise<void> {
    this.customers = projection;
  }

  async getCustomersProjection(): Promise<CustomersProjection | null> {
    return this.customers;
  }

  async saveSellersProjection(projection: SellersProjection): Promise<void> {
    this.sellers = projection;
  }

  async getSellersProjection(): Promise<SellersProjection | null> {
    return this.sellers;
  }

  async saveProductsProjection(projection: ProductsProjection): Promise<void> {
    this.products = projection;
  }

  async getProductsProjection(): Promise<ProductsProjection | null> {
    return this.products;
  }

  async saveMarketplaceProjection(projection: MarketplaceProjection): Promise<void> {
    this.marketplace = projection;
  }

  async getMarketplaceProjection(): Promise<MarketplaceProjection | null> {
    return this.marketplace;
  }

  async clearAllProjections(): Promise<void> {
    this.sales = null;
    this.orders = null;
    this.customers = null;
    this.sellers = null;
    this.products = null;
    this.marketplace = null;
  }
}
