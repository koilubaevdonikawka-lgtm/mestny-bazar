import { getServerEnv, isPlatformCatalogEnabled, type ServerEnv } from "@server/config/env";
import { CatalogService } from "@server/domain/catalog.service";
import { CheckoutService } from "@server/domain/checkout.service";
import { InventoryService } from "@server/domain/inventory.service";
import { NotificationService } from "@server/domain/notification.service";
import { NotificationCenter } from "@server/domain/notification-center.service";
import { OrderService } from "@server/domain/order.service";
import { PricingService } from "@server/domain/pricing.service";
import { ShopifyCatalogAdapter } from "@server/adapters/migration/shopify.adapter";
import { StubNotificationAdapter } from "@server/adapters/notifications/stub-notification.adapter";
import { StubOrderEventNotifier } from "@server/adapters/notifications/stub-order-event.notifier";
import { CheckoutPaymentHandler } from "@server/adapters/payment/checkout-payment.handler";
import { FinikPaymentAdapter } from "@server/adapters/payment/finik.adapter";
import { SupabaseAddressRepository } from "@server/adapters/supabase/address.repository";
import { SupabaseDeliveryZoneRepository } from "@server/adapters/supabase/delivery-zone.repository";
import { SupabaseOrderRepository } from "@server/adapters/supabase/order.repository";
import { SupabaseProductRepository } from "@server/adapters/supabase/product.repository";
import { SupabaseSellerProductRepository } from "@server/adapters/supabase/seller-product.repository";
import type { IAddressRepository } from "@server/ports/address.repository";
import type { ICheckoutPaymentHandler } from "@server/ports/checkout-payment.port";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import type { IOrderEventNotifier } from "@server/ports/order-events.port";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IPaymentProvider } from "@server/ports/payment.provider";
import type { INotificationProvider } from "@server/ports/notification.provider";
import type { INotificationCenter } from "@server/ports/notification-center.port";
import type { IProductRepository } from "@server/ports/product.repository";
import type { IPaymentPolicy } from "@server/ports/payment-policy.port";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import { PaymentPolicyService } from "@server/domain/payment-policy/payment-policy.service";
import { OrderLifecycleService } from "@server/domain/order-lifecycle/order-lifecycle.service";
import { CashRequiresAuthenticationRule } from "@server/domain/payment-policy/rules/cash-requires-auth.rule";
import { OnlineAllowedRule } from "@server/domain/payment-policy/rules/online-allowed.rule";
import { BootstrapCreatedRule } from "@server/domain/order-lifecycle/rules/bootstrap-created.rule";
import { TerminalStateGuardRule } from "@server/domain/order-lifecycle/rules/terminal-state-guard.rule";
import { AdminConfirmOrderRule } from "@server/domain/order-lifecycle/rules/admin-confirm-order.rule";
import { AdminCancelOrderRule } from "@server/domain/order-lifecycle/rules/admin-cancel-order.rule";
import { CustomerCancelOrderRule } from "@server/domain/order-lifecycle/rules/customer-cancel-order.rule";
import { WarehouseStartAssemblyRule } from "@server/domain/order-lifecycle/rules/warehouse-start-assembly.rule";
import { WarehouseCompleteAssemblyRule } from "@server/domain/order-lifecycle/rules/warehouse-complete-assembly.rule";
import { CourierAcceptOrderRule } from "@server/domain/order-lifecycle/rules/courier-accept-order.rule";
import { CourierStartDeliveryRule } from "@server/domain/order-lifecycle/rules/courier-start-delivery.rule";
import { CourierArriveRule } from "@server/domain/order-lifecycle/rules/courier-arrive.rule";
import { CourierCompleteDeliveryRule } from "@server/domain/order-lifecycle/rules/courier-complete-delivery.rule";
import { AddressService } from "@server/domain/address.service";
import { AdminOrderService } from "@server/domain/admin-order.service";
import { WarehouseOrderService } from "@server/domain/warehouse-order.service";
import { CourierOrderService } from "@server/domain/courier-order.service";
import { SellerProductService } from "@server/domain/seller-product.service";
import { ProductPublicationService } from "@server/domain/product-publication/product-publication.service";
import { BootstrapDraftRule } from "@server/domain/product-publication/rules/bootstrap-draft.rule";
import { SellerPublishRule } from "@server/domain/product-publication/rules/seller-publish.rule";
import { SellerHideRule } from "@server/domain/product-publication/rules/seller-hide.rule";
import type { IProductPublicationPolicy } from "@server/ports/product-publication.port";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import type { IMarketplaceStandards } from "@server/ports/marketplace-standards/marketplace-standards.port";
import {
  BusinessStandardsService,
  CategoryStandardsService,
  ContentStandardsService,
  MarketplaceStandardsService,
  MediaStandardsService,
  PublicationStandardsService,
  QualityStandardsService,
} from "@server/domain/marketplace-standards";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import {
  MarketplaceEventsService,
  subscribeNotificationCenter,
} from "@server/domain/marketplace-events";
import type { IAuditLog } from "@server/ports/audit-log.port";
import { AuditLogService, subscribeAuditLog } from "@server/domain/audit-log";
import {
  AIMediaWorker,
  AICatalogWorker,
  AIWorkerRegistry,
  AIOrchestrator,
  AIExecutionPlanner,
  AIResultAggregator,
  MediaMetadataService,
  MediaQualityAnalyzerService,
  CatalogQualityAnalyzerService,
  subscribeAIWorkers,
} from "@server/domain/marketplace-ai";

export interface ServiceContainer {
  catalog: CatalogService;
  checkout: CheckoutService;
  orderService: OrderService;
  adminOrderService: AdminOrderService;
  warehouseOrderService: WarehouseOrderService;
  courierOrderService: CourierOrderService;
  sellerProductService: SellerProductService;
  addressService: AddressService;
  notificationService: NotificationService;
  notificationCenter: INotificationCenter;
  catalogProducts: IProductRepository;
  orderProducts: IProductRepository;
  orders: IOrderRepository;
  sellerProducts: ISellerProductRepository;
  addresses: IAddressRepository;
  zones: IDeliveryZoneRepository;
  payments: IPaymentProvider;
  checkoutPayment: ICheckoutPaymentHandler;
  paymentPolicy: IPaymentPolicy;
  orderLifecycle: IOrderLifecyclePolicy;
  productPublication: IProductPublicationPolicy;
  marketplaceStandards: IMarketplaceStandards;
  marketplaceEvents: IMarketplaceEventBus;
  auditLog: IAuditLog;
  aiWorkers: AIWorkerRegistry;
  aiOrchestrator: AIOrchestrator;
  notifications: INotificationProvider;
  orderEvents: IOrderEventNotifier;
}

let container: ServiceContainer | undefined;

function createProductRepository(_env: ServerEnv): IProductRepository {
  if (isPlatformCatalogEnabled()) {
    return new SupabaseProductRepository();
  }
  return new ShopifyCatalogAdapter();
}

/** Composition root — wires concrete adapters to port interfaces. */
export function createServices(env: ServerEnv): ServiceContainer {
  const catalogProducts = createProductRepository(env);
  const orderProducts = new SupabaseProductRepository();
  const orders = new SupabaseOrderRepository();
  const sellerProducts = new SupabaseSellerProductRepository();
  const addresses = new SupabaseAddressRepository();
  const zones = new SupabaseDeliveryZoneRepository();
  const payments = new FinikPaymentAdapter();
  const notifications = new StubNotificationAdapter();
  const orderEvents = new StubOrderEventNotifier(notifications);
  const checkoutPayment = new CheckoutPaymentHandler(payments);
  // Payment policy rule chain (ascending order):
  //   0–70  — future global guards (Maintenance, BlockedUser, Corporate, …)
  //   80    — CashRequiresAuthenticationRule
  //   90    — OnlineAllowedRule
  const paymentPolicy: IPaymentPolicy = new PaymentPolicyService([
    new CashRequiresAuthenticationRule(),
    new OnlineAllowedRule(),
  ]);

  // Order lifecycle: checkout bootstrap + admin + warehouse + courier transitions.
  const orderLifecycle: IOrderLifecyclePolicy = new OrderLifecycleService([
    new TerminalStateGuardRule(),
    new AdminConfirmOrderRule(),
    new AdminCancelOrderRule(),
    new CustomerCancelOrderRule(),
    new WarehouseStartAssemblyRule(),
    new WarehouseCompleteAssemblyRule(),
    new CourierAcceptOrderRule(),
    new CourierStartDeliveryRule(),
    new CourierArriveRule(),
    new CourierCompleteDeliveryRule(),
    new BootstrapCreatedRule(),
  ]);

  // Product publication: seller create + publish/hide transitions.
  const productPublication: IProductPublicationPolicy = new ProductPublicationService([
    new SellerPublishRule(),
    new SellerHideRule(),
    new BootstrapDraftRule(),
  ]);

  // Marketplace standards — infrastructure; publication delegates to productPublication.
  const marketplaceStandards: IMarketplaceStandards = new MarketplaceStandardsService({
    category: new CategoryStandardsService(),
    media: new MediaStandardsService(),
    content: new ContentStandardsService(),
    quality: new QualityStandardsService(),
    publication: new PublicationStandardsService(productPublication),
    business: new BusinessStandardsService(),
  });

  const orderService = new OrderService(orders, orderLifecycle);
  const adminOrderService = new AdminOrderService(orders, orderLifecycle);
  const warehouseOrderService = new WarehouseOrderService(orders, orderLifecycle);
  const courierOrderService = new CourierOrderService(orders, orderLifecycle);
  const sellerProductService = new SellerProductService(sellerProducts, productPublication);
  const addressService = new AddressService(addresses);
  const pricing = new PricingService(zones);
  const inventory = new InventoryService(orderProducts);
  const marketplaceEvents: IMarketplaceEventBus = new MarketplaceEventsService();
  const auditLog: IAuditLog = new AuditLogService();
  const notificationCenter = new NotificationCenter(orderEvents, notifications);
  subscribeNotificationCenter(marketplaceEvents, notificationCenter);
  subscribeAuditLog(marketplaceEvents, auditLog);
  const aiWorkers = new AIWorkerRegistry();
  const mediaMetadata = new MediaMetadataService();
  const mediaQualityAnalyzer = new MediaQualityAnalyzerService();
  const catalogQualityAnalyzer = new CatalogQualityAnalyzerService();
  aiWorkers.register(new AIMediaWorker(mediaMetadata, mediaQualityAnalyzer, marketplaceEvents));
  aiWorkers.register(new AICatalogWorker(catalogQualityAnalyzer, marketplaceEvents));
  const aiExecutionPlanner = new AIExecutionPlanner(aiWorkers);
  const aiResultAggregator = new AIResultAggregator();
  const aiOrchestrator = new AIOrchestrator(
    aiExecutionPlanner,
    aiWorkers,
    aiResultAggregator,
    marketplaceEvents,
  );
  subscribeAIWorkers(marketplaceEvents, aiOrchestrator);
  const notificationService = new NotificationService(marketplaceEvents);

  const checkout = new CheckoutService(
    orderService,
    orderProducts,
    addresses,
    zones,
    pricing,
    inventory,
    checkoutPayment,
    marketplaceEvents,
    paymentPolicy,
    orderLifecycle,
  );

  return {
    catalogProducts,
    orderProducts,
    orders,
    sellerProducts,
    addresses,
    zones,
    payments,
    notifications,
    orderEvents,
    checkoutPayment,
    paymentPolicy,
    orderLifecycle,
    productPublication,
    marketplaceStandards,
    marketplaceEvents,
    auditLog,
    aiWorkers,
    aiOrchestrator,
    catalog: new CatalogService(catalogProducts),
    orderService,
    adminOrderService,
    warehouseOrderService,
    courierOrderService,
    sellerProductService,
    addressService,
    notificationService,
    notificationCenter,
    checkout,
  };
}

export function getServices(): ServiceContainer {
  if (!container) {
    container = createServices(getServerEnv());
  }
  return container;
}
