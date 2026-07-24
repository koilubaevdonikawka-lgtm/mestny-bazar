import { BootstrapTokens } from "@server/bootstrap/tokens";
import {
  AnalyticsEventSubscriber,
  AnalyticsService,
} from "@server/application/modules/analytics/analytics/services";
import { CustomerService } from "@server/application/modules/customer/customer/services";
import { MarketplaceService } from "@server/application/modules/marketplace/marketplace/services";
import { OrderService } from "@server/application/modules/order/order/services";
import { PaymentService } from "@server/application/modules/payment/payment/services";
import { ProductService } from "@server/application/modules/product/product/services";
import { SellerService } from "@server/application/modules/seller/seller/services";
import type { IEventBus } from "@server/application/ports";
import type { ServiceProvider, ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CapabilityEventPublisher } from "@server/infrastructure/analytics/capability-event-publisher";
import {
  asCustomerService,
  EventPublishingCustomerService,
} from "@server/infrastructure/analytics/wiring/event-publishing-customer.service";
import {
  asMarketplaceService,
  EventPublishingMarketplaceService,
} from "@server/infrastructure/analytics/wiring/event-publishing-marketplace.service";
import {
  asOrderService,
  EventPublishingOrderService,
} from "@server/infrastructure/analytics/wiring/event-publishing-order.service";
import {
  asPaymentService,
  EventPublishingPaymentService,
} from "@server/infrastructure/analytics/wiring/event-publishing-payment.service";
import {
  asProductService,
  EventPublishingProductService,
} from "@server/infrastructure/analytics/wiring/event-publishing-product.service";
import {
  asSellerService,
  EventPublishingSellerService,
} from "@server/infrastructure/analytics/wiring/event-publishing-seller.service";

const analyticsEventSubscriber = new AnalyticsEventSubscriber();

/** Wraps capability services to publish domain events and wires Analytics subscriptions. */
export function registerAnalyticsEventWiring(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.CapabilityEventPublisher, (provider) =>
    new CapabilityEventPublisher(provider.resolve<IEventBus>(InfrastructureTokens.EventBus)),
  );

  registry.registerSingleton(BootstrapTokens.AnalyticsEventSubscriber, () => analyticsEventSubscriber);
}

/** Activates Analytics event subscriptions after the service provider is built. */
export function activateAnalyticsEventSubscriptions(provider: ServiceProvider): void {
  const eventBus = provider.resolve<IEventBus>(InfrastructureTokens.EventBus);
  const analytics = provider.resolve<AnalyticsService>(BootstrapTokens.AnalyticsService);
  analyticsEventSubscriber.subscribe(eventBus, analytics);
}

export function wrapOrderServiceForAnalytics(
  inner: OrderService,
  publisher: CapabilityEventPublisher,
): OrderService {
  return asOrderService(new EventPublishingOrderService(inner, publisher));
}

export function wrapPaymentServiceForAnalytics(
  inner: PaymentService,
  publisher: CapabilityEventPublisher,
): PaymentService {
  return asPaymentService(new EventPublishingPaymentService(inner, publisher));
}

export function wrapCustomerServiceForAnalytics(
  inner: CustomerService,
  publisher: CapabilityEventPublisher,
): CustomerService {
  return asCustomerService(new EventPublishingCustomerService(inner, publisher));
}

export function wrapSellerServiceForAnalytics(
  inner: SellerService,
  publisher: CapabilityEventPublisher,
): SellerService {
  return asSellerService(new EventPublishingSellerService(inner, publisher));
}

export function wrapProductServiceForAnalytics(
  inner: ProductService,
  publisher: CapabilityEventPublisher,
): ProductService {
  return asProductService(new EventPublishingProductService(inner, publisher));
}

export function wrapMarketplaceServiceForAnalytics(
  inner: MarketplaceService,
  publisher: CapabilityEventPublisher,
): MarketplaceService {
  return asMarketplaceService(new EventPublishingMarketplaceService(inner, publisher));
}
