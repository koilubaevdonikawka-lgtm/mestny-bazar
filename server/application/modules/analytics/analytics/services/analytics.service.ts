import type { IAnalyticsStore } from "@server/application/modules/analytics/analytics/contracts";
import type {
  GetCustomerMetricsDto,
  GetMarketplaceMetricsDto,
  GetOrderMetricsDto,
  GetProductMetricsDto,
  GetSalesMetricsDto,
  GetSellerMetricsDto,
  RebuildProjectionDto,
} from "@server/application/modules/analytics/analytics/dto";
import {
  createMetricsUpdatedEvent,
  createProjectionRebuiltEvent,
} from "@server/application/modules/analytics/analytics/events";
import {
  createEmptyCustomerMetrics,
  createEmptyMarketplaceMetrics,
  createEmptyOrderMetrics,
  createEmptyProductMetrics,
  createEmptySalesMetrics,
  createEmptySellerMetrics,
  withCustomerRegisteredMetrics,
  withListingPublishedMetrics,
  withListingUnpublishedMetrics,
  withOrderCreatedMetrics,
  withOrderStatusMetrics,
  withProductCreatedMetrics,
  withProductReadyMetrics,
  withSalesMetricsUpdate,
  withSellerApprovedMetrics,
  withSellerRegisteredMetrics,
  withSellerSuspendedMetrics,
  type CustomerMetrics,
  type MarketplaceMetrics,
  type OrderMetrics,
  type ProductMetrics,
  type SalesMetrics,
  type SellerMetrics,
} from "@server/application/modules/analytics/analytics/models";
import {
  createCustomersProjection,
  createMarketplaceProjection,
  createOrdersProjection,
  createProductsProjection,
  createSalesProjection,
  createSellersProjection,
  withCustomersProjectionEvent,
  withMarketplaceProjectionEvent,
  withOrdersProjectionEvent,
  withProductsProjectionEvent,
  withSalesProjectionEvent,
  withSellersProjectionEvent,
} from "@server/application/modules/analytics/analytics/projections";
import { AnalyticsCapabilityEventName } from "@server/application/modules/analytics/analytics/services/analytics-capability-event-names";
import type { ApplicationDomainEvent } from "@server/application/shared";

/** Analytics business capability service — orchestrates projections via IAnalyticsStore. */
export class AnalyticsService {
  constructor(private readonly store: IAnalyticsStore) {}

  async getSalesMetrics(dto: GetSalesMetricsDto = {}): Promise<SalesMetrics> {
    const projection = await this.requireSalesProjection(dto.currency);
    return projection.metrics;
  }

  async getOrderMetrics(_dto: GetOrderMetricsDto = {}): Promise<OrderMetrics> {
    const projection = await this.requireOrdersProjection();
    return projection.metrics;
  }

  async getCustomerMetrics(_dto: GetCustomerMetricsDto = {}): Promise<CustomerMetrics> {
    const projection = await this.requireCustomersProjection();
    return projection.metrics;
  }

  async getSellerMetrics(_dto: GetSellerMetricsDto = {}): Promise<SellerMetrics> {
    const projection = await this.requireSellersProjection();
    return projection.metrics;
  }

  async getProductMetrics(_dto: GetProductMetricsDto = {}): Promise<ProductMetrics> {
    const projection = await this.requireProductsProjection();
    return projection.metrics;
  }

  async getMarketplaceMetrics(_dto: GetMarketplaceMetricsDto = {}): Promise<MarketplaceMetrics> {
    const projection = await this.requireMarketplaceProjection();
    return projection.metrics;
  }

  async rebuildProjection(dto: RebuildProjectionDto = {}): Promise<void> {
    if (!dto.projectionId) {
      await this.store.clearAllProjections();
      createProjectionRebuiltEvent("all");
      return;
    }

    switch (dto.projectionId) {
      case "sales":
        await this.store.saveSalesProjection(createSalesProjection(createEmptySalesMetrics()));
        break;
      case "orders":
        await this.store.saveOrdersProjection(createOrdersProjection(createEmptyOrderMetrics()));
        break;
      case "customers":
        await this.store.saveCustomersProjection(
          createCustomersProjection(createEmptyCustomerMetrics()),
        );
        break;
      case "sellers":
        await this.store.saveSellersProjection(createSellersProjection(createEmptySellerMetrics()));
        break;
      case "products":
        await this.store.saveProductsProjection(
          createProductsProjection(createEmptyProductMetrics()),
        );
        break;
      case "marketplace":
        await this.store.saveMarketplaceProjection(
          createMarketplaceProjection(createEmptyMarketplaceMetrics()),
        );
        break;
      default:
        throw new Error(`Unknown projection id: ${dto.projectionId}`);
    }

    createProjectionRebuiltEvent(dto.projectionId);
  }

  async handleDomainEvent(event: ApplicationDomainEvent): Promise<void> {
    switch (event.eventName) {
      case AnalyticsCapabilityEventName.OrderCreated:
        await this.onOrderCreated(event);
        return;
      case AnalyticsCapabilityEventName.OrderStatusChanged:
        await this.onOrderStatusChanged(event);
        return;
      case AnalyticsCapabilityEventName.PaymentSucceeded:
        await this.onPaymentSucceeded(event);
        return;
      case AnalyticsCapabilityEventName.CustomerCreated:
        await this.onCustomerCreated(event);
        return;
      case AnalyticsCapabilityEventName.SellerCreated:
        await this.onSellerCreated(event);
        return;
      case AnalyticsCapabilityEventName.SellerApproved:
        await this.onSellerApproved(event);
        return;
      case AnalyticsCapabilityEventName.SellerSuspended:
        await this.onSellerSuspended(event);
        return;
      case AnalyticsCapabilityEventName.ProductCreated:
        await this.onProductCreated(event);
        return;
      case AnalyticsCapabilityEventName.ProductReadyForPublication:
        await this.onProductReady(event);
        return;
      case AnalyticsCapabilityEventName.ListingPublished:
        await this.onListingPublished(event);
        return;
      case AnalyticsCapabilityEventName.ListingUnpublished:
        await this.onListingUnpublished(event);
        return;
      default:
        return;
    }
  }

  private async onOrderCreated(event: ApplicationDomainEvent): Promise<void> {
    const itemCount = readNumber(event.payload.itemCount);
    const orders = await this.requireOrdersProjection();
    const metrics = withOrderCreatedMetrics(orders.metrics, itemCount);
    const updated = withOrdersProjectionEvent(orders, metrics, event.eventName);
    await this.store.saveOrdersProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "orders", eventName: event.eventName });
  }

  private async onOrderStatusChanged(event: ApplicationDomainEvent): Promise<void> {
    const status = readString(event.payload.status);
    const orders = await this.requireOrdersProjection();
    const metrics = withOrderStatusMetrics(orders.metrics, status);
    const updated = withOrdersProjectionEvent(orders, metrics, event.eventName);
    await this.store.saveOrdersProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "orders", eventName: event.eventName });
  }

  private async onPaymentSucceeded(event: ApplicationDomainEvent): Promise<void> {
    const amount = readNumber(event.payload.amount);
    const currency = readString(event.payload.currency, "KGS");
    const sales = await this.requireSalesProjection(currency);
    const metrics = withSalesMetricsUpdate(sales.metrics, { orderTotal: amount, currency });
    const updated = withSalesProjectionEvent(sales, metrics, event.eventName);
    await this.store.saveSalesProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "sales", eventName: event.eventName });
  }

  private async onCustomerCreated(event: ApplicationDomainEvent): Promise<void> {
    const customers = await this.requireCustomersProjection();
    const metrics = withCustomerRegisteredMetrics(customers.metrics);
    const updated = withCustomersProjectionEvent(customers, metrics, event.eventName);
    await this.store.saveCustomersProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "customers", eventName: event.eventName });
  }

  private async onSellerCreated(event: ApplicationDomainEvent): Promise<void> {
    const sellers = await this.requireSellersProjection();
    const metrics = withSellerRegisteredMetrics(sellers.metrics);
    const updated = withSellersProjectionEvent(sellers, metrics, event.eventName);
    await this.store.saveSellersProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "sellers", eventName: event.eventName });
  }

  private async onSellerApproved(event: ApplicationDomainEvent): Promise<void> {
    const sellers = await this.requireSellersProjection();
    const metrics = withSellerApprovedMetrics(sellers.metrics);
    const updated = withSellersProjectionEvent(sellers, metrics, event.eventName);
    await this.store.saveSellersProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "sellers", eventName: event.eventName });
  }

  private async onSellerSuspended(event: ApplicationDomainEvent): Promise<void> {
    const sellers = await this.requireSellersProjection();
    const metrics = withSellerSuspendedMetrics(sellers.metrics);
    const updated = withSellersProjectionEvent(sellers, metrics, event.eventName);
    await this.store.saveSellersProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "sellers", eventName: event.eventName });
  }

  private async onProductCreated(event: ApplicationDomainEvent): Promise<void> {
    const products = await this.requireProductsProjection();
    const metrics = withProductCreatedMetrics(products.metrics);
    const updated = withProductsProjectionEvent(products, metrics, event.eventName);
    await this.store.saveProductsProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "products", eventName: event.eventName });
  }

  private async onProductReady(event: ApplicationDomainEvent): Promise<void> {
    const products = await this.requireProductsProjection();
    const metrics = withProductReadyMetrics(products.metrics);
    const updated = withProductsProjectionEvent(products, metrics, event.eventName);
    await this.store.saveProductsProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "products", eventName: event.eventName });
  }

  private async onListingPublished(event: ApplicationDomainEvent): Promise<void> {
    const marketplace = await this.requireMarketplaceProjection();
    const metrics = withListingPublishedMetrics(marketplace.metrics);
    const updated = withMarketplaceProjectionEvent(marketplace, metrics, event.eventName);
    await this.store.saveMarketplaceProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "marketplace", eventName: event.eventName });
  }

  private async onListingUnpublished(event: ApplicationDomainEvent): Promise<void> {
    const marketplace = await this.requireMarketplaceProjection();
    const metrics = withListingUnpublishedMetrics(marketplace.metrics);
    const updated = withMarketplaceProjectionEvent(marketplace, metrics, event.eventName);
    await this.store.saveMarketplaceProjection(updated);
    createMetricsUpdatedEvent({ projectionId: "marketplace", eventName: event.eventName });
  }

  private async requireSalesProjection(currency?: string) {
    const existing = await this.store.getSalesProjection();
    if (existing) {
      return existing;
    }
    const projection = createSalesProjection(createEmptySalesMetrics(currency));
    await this.store.saveSalesProjection(projection);
    return projection;
  }

  private async requireOrdersProjection() {
    const existing = await this.store.getOrdersProjection();
    if (existing) {
      return existing;
    }
    const projection = createOrdersProjection(createEmptyOrderMetrics());
    await this.store.saveOrdersProjection(projection);
    return projection;
  }

  private async requireCustomersProjection() {
    const existing = await this.store.getCustomersProjection();
    if (existing) {
      return existing;
    }
    const projection = createCustomersProjection(createEmptyCustomerMetrics());
    await this.store.saveCustomersProjection(projection);
    return projection;
  }

  private async requireSellersProjection() {
    const existing = await this.store.getSellersProjection();
    if (existing) {
      return existing;
    }
    const projection = createSellersProjection(createEmptySellerMetrics());
    await this.store.saveSellersProjection(projection);
    return projection;
  }

  private async requireProductsProjection() {
    const existing = await this.store.getProductsProjection();
    if (existing) {
      return existing;
    }
    const projection = createProductsProjection(createEmptyProductMetrics());
    await this.store.saveProductsProjection(projection);
    return projection;
  }

  private async requireMarketplaceProjection() {
    const existing = await this.store.getMarketplaceProjection();
    if (existing) {
      return existing;
    }
    const projection = createMarketplaceProjection(createEmptyMarketplaceMetrics());
    await this.store.saveMarketplaceProjection(projection);
    return projection;
  }
}

function readNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}
