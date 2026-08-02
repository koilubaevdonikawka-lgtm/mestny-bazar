import { getServerEnv, type ServerEnv } from "@server/config/env";
import { CartService } from "@server/domain/cart.service";
import { CatalogService } from "@server/domain/catalog.service";
import { CategoryService } from "@server/domain/category.service";
import { CategoryAdminService } from "@server/domain/category-admin.service";
import { CheckoutService } from "@server/domain/checkout.service";
import { CourierAdminService } from "@server/domain/courier-admin.service";
import { CourierAssignmentService } from "@server/domain/courier-assignment.service";
import { CourierStatusService } from "@server/domain/courier-status.service";
import { DashboardService } from "@server/domain/dashboard.service";
import { InventoryService } from "@server/domain/inventory.service";
import { NotificationService } from "@server/domain/notification.service";
import { NotificationCenter } from "@server/domain/notification-center.service";
import { OrderService } from "@server/domain/order.service";
import { OrderLifecycleCascadeService } from "@server/domain/order-lifecycle-cascade.service";
import { PermissionPolicyService } from "@server/domain/permission-policy/permission-policy.service";
import { AdminFullAccessRule } from "@server/domain/permission-policy/rules/admin-full-access.rule";
import { AdminFinanceScopeRule } from "@server/domain/permission-policy/rules/admin-finance-scope.rule";
import { AdminMarketingScopeRule } from "@server/domain/permission-policy/rules/admin-marketing-scope.rule";
import { PricingService } from "@server/domain/pricing.service";
import { SellerProfileService } from "@server/domain/seller-profile.service";
import { SettingsService } from "@server/domain/settings.service";
import { StockAdminService } from "@server/domain/stock-admin.service";
import { StockPolicyService } from "@server/domain/stock-policy/stock-policy.service";
import { LowStockThresholdRule } from "@server/domain/stock-policy/rules/low-stock-threshold.rule";
import { SupplierService } from "@server/domain/supplier.service";
import { SupplyService } from "@server/domain/supply.service";
import { UserAdminService } from "@server/domain/user-admin.service";
import { CourierAssignmentPolicyService } from "@server/domain/courier-assignment/courier-assignment.service";
import { LeastLoadedAvailableCourierRule } from "@server/domain/courier-assignment/rules/least-loaded-available-courier.rule";
import { AnalyticsService } from "@server/domain/analytics.service";
import { CommissionPolicyService } from "@server/domain/commission-policy/commission-policy.service";
import { FlatCommissionRule } from "@server/domain/commission-policy/rules/flat-commission.rule";
import { PayoutService } from "@server/domain/payout.service";
import { DiscountPolicyService } from "@server/domain/discount-policy/discount-policy.service";
import { CouponValidityRule } from "@server/domain/discount-policy/rules/coupon-validity.rule";
import { CouponMinOrderRule } from "@server/domain/discount-policy/rules/coupon-min-order.rule";
import { CouponDiscountAmountRule } from "@server/domain/discount-policy/rules/coupon-discount-amount.rule";
import { CouponService } from "@server/domain/coupon.service";
import { BannerService } from "@server/domain/banner.service";
import { AutomationOverviewService } from "@server/domain/automation-overview.service";
import {
  IntegrationsStatusService,
  type IntegrationSecretPresence,
} from "@server/domain/integrations-status.service";
import { SecurityOverviewService } from "@server/domain/security-overview.service";
import { AuditLogQueryService } from "@server/domain/audit-log-query.service";
import { SupabaseCouponRepository } from "@server/adapters/supabase/coupon.repository";
import { SupabasePayoutRepository } from "@server/adapters/supabase/payout.repository";
import { SupabaseBannerRepository } from "@server/adapters/supabase/banner.repository";
import type { ICouponRepository } from "@server/ports/coupon.repository";
import type { IPayoutRepository } from "@server/ports/payout.repository";
import type { IBannerRepository } from "@server/ports/banner.repository";
import type { ICommissionPolicy } from "@server/ports/commission-policy.port";
import type { IDiscountPolicy } from "@server/ports/discount-policy.port";
import { StubNotificationAdapter } from "@server/adapters/notifications/stub-notification.adapter";
import { StubOrderEventNotifier } from "@server/adapters/notifications/stub-order-event.notifier";
import { CheckoutPaymentHandler } from "@server/adapters/payment/checkout-payment.handler";
import { FinikPaymentAdapter } from "@server/adapters/payment/finik.adapter";
import { SupabaseAddressRepository } from "@server/adapters/supabase/address.repository";
import { SupabaseCartRepository } from "@server/adapters/supabase/cart.repository";
import { SupabaseCategoryRepository } from "@server/adapters/supabase/category.repository";
import { SupabaseAdminCategoryRepository } from "@server/adapters/supabase/category-admin.repository";
import { SupabaseCourierStatusRepository } from "@server/adapters/supabase/courier-status.repository";
import { SupabaseCustomerStatusRepository } from "@server/adapters/supabase/customer-status.repository";
import { SupabaseDeliveryZoneRepository } from "@server/adapters/supabase/delivery-zone.repository";
import { SupabaseOrderRepository } from "@server/adapters/supabase/order.repository";
import { SupabaseOrderCascadeRepository } from "@server/adapters/supabase/order-cascade.repository";
import { SupabaseProductRepository } from "@server/adapters/supabase/product.repository";
import { SupabaseSellerProductRepository } from "@server/adapters/supabase/seller-product.repository";
import { SupabaseSellerProfileRepository } from "@server/adapters/supabase/seller-profile.repository";
import { SupabaseSettingsRepository } from "@server/adapters/supabase/settings.repository";
import { SupabaseStockRepository } from "@server/adapters/supabase/stock.repository";
import { SupabaseSupplierRepository } from "@server/adapters/supabase/supplier.repository";
import { SupabaseSupplyRepository } from "@server/adapters/supabase/supply.repository";
import { SupabaseUserAdminRepository } from "@server/adapters/supabase/user-admin.repository";
import type { IAddressRepository } from "@server/ports/address.repository";
import type { ICartRepository } from "@server/ports/cart.repository";
import type { ICategoryRepository } from "@server/ports/category.repository";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import type { ICheckoutPaymentHandler } from "@server/ports/checkout-payment.port";
import type { ICourierAssignmentPolicy } from "@server/ports/courier-assignment.port";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { ICustomerStatusRepository } from "@server/ports/customer-status.repository";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import type { IOrderEventNotifier } from "@server/ports/order-events.port";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderCascadeRepository } from "@server/ports/order-cascade.repository";
import type { IPermissionPolicy } from "@server/ports/permission-policy.port";
import type { IPaymentProvider } from "@server/ports/payment.provider";
import type { ISellerProfileRepository } from "@server/ports/seller-profile.repository";
import type { ISettingsRepository } from "@server/ports/settings.repository";
import type { IStockRepository } from "@server/ports/stock.repository";
import type { IStockPolicy } from "@server/ports/stock-policy.port";
import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type { ISupplyRepository } from "@server/ports/supply.repository";
import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { INotificationProvider } from "@server/ports/notification.provider";
import type { INotificationCenter } from "@server/ports/notification-center.port";
import type { IProductRepository } from "@server/ports/product.repository";
import type { IPaymentPolicy } from "@server/ports/payment-policy.port";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import { PaymentPolicyService } from "@server/domain/payment-policy/payment-policy.service";
import { OrderLifecycleService } from "@server/domain/order-lifecycle/order-lifecycle.service";
import { BlockedUserRule } from "@server/domain/payment-policy/rules/blocked-user.rule";
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
import { subscribeAuditLog } from "@server/domain/audit-log";
import { SupabaseAuditLog } from "@server/adapters/supabase/audit-log.repository";
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
  categories: CategoryService;
  categoryAdminService: CategoryAdminService;
  cartService: CartService;
  carts: ICartRepository;
  checkout: CheckoutService;
  orderService: OrderService;
  adminOrderService: AdminOrderService;
  warehouseOrderService: WarehouseOrderService;
  courierOrderService: CourierOrderService;
  courierAdminService: CourierAdminService;
  courierAssignmentPolicy: ICourierAssignmentPolicy;
  courierAssignmentService: CourierAssignmentService;
  courierStatus: ICourierStatusRepository;
  courierStatusService: CourierStatusService;
  customerStatus: ICustomerStatusRepository;
  sellerProductService: SellerProductService;
  sellerProfiles: ISellerProfileRepository;
  sellerProfileService: SellerProfileService;
  suppliers: ISupplierRepository;
  supplierService: SupplierService;
  supplies: ISupplyRepository;
  supplyService: SupplyService;
  userAdmin: IUserAdminRepository;
  userAdminService: UserAdminService;
  addressService: AddressService;
  notificationService: NotificationService;
  notificationCenter: INotificationCenter;
  catalogProducts: IProductRepository;
  orderProducts: IProductRepository;
  orders: IOrderRepository;
  orderCascades: IOrderCascadeRepository;
  orderCascadeService: OrderLifecycleCascadeService;
  sellerProducts: ISellerProductRepository;
  addresses: IAddressRepository;
  zones: IDeliveryZoneRepository;
  adminCategories: IAdminCategoryRepository;
  stock: IStockRepository;
  stockPolicy: IStockPolicy;
  stockAdminService: StockAdminService;
  dashboardService: DashboardService;
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
  permissionPolicy: IPermissionPolicy;
  settings: ISettingsRepository;
  settingsService: SettingsService;
  analyticsService: AnalyticsService;
  commissionPolicy: ICommissionPolicy;
  payouts: IPayoutRepository;
  payoutService: PayoutService;
  discountPolicy: IDiscountPolicy;
  coupons: ICouponRepository;
  couponService: CouponService;
  banners: IBannerRepository;
  bannerService: BannerService;
  automationOverviewService: AutomationOverviewService;
  integrationsStatusService: IntegrationsStatusService;
  securityOverviewService: SecurityOverviewService;
  auditLogQueryService: AuditLogQueryService;
}

let container: ServiceContainer | undefined;

/** Composition root — wires concrete adapters to port interfaces. */
export function createServices(env: ServerEnv): ServiceContainer {
  const catalogProducts: IProductRepository = new SupabaseProductRepository();
  const orderProducts = new SupabaseProductRepository();
  const orders = new SupabaseOrderRepository();
  const orderCascades: IOrderCascadeRepository = new SupabaseOrderCascadeRepository();
  const sellerProducts = new SupabaseSellerProductRepository();
  const sellerProfiles: ISellerProfileRepository = new SupabaseSellerProfileRepository();
  const suppliers: ISupplierRepository = new SupabaseSupplierRepository();
  const supplies: ISupplyRepository = new SupabaseSupplyRepository();
  const courierStatus: ICourierStatusRepository = new SupabaseCourierStatusRepository();
  const customerStatus: ICustomerStatusRepository = new SupabaseCustomerStatusRepository();
  const userAdmin: IUserAdminRepository = new SupabaseUserAdminRepository();
  const addresses = new SupabaseAddressRepository();
  const carts = new SupabaseCartRepository();
  const settings: ISettingsRepository = new SupabaseSettingsRepository();
  const zones = new SupabaseDeliveryZoneRepository();
  const categoryRepository: ICategoryRepository = new SupabaseCategoryRepository();
  const adminCategories: IAdminCategoryRepository = new SupabaseAdminCategoryRepository();
  const stock: IStockRepository = new SupabaseStockRepository();
  const coupons: ICouponRepository = new SupabaseCouponRepository();
  const payouts: IPayoutRepository = new SupabasePayoutRepository();
  const banners: IBannerRepository = new SupabaseBannerRepository();
  const payments = new FinikPaymentAdapter();
  const notifications = new StubNotificationAdapter();
  const orderEvents = new StubOrderEventNotifier(notifications);
  const checkoutPayment = new CheckoutPaymentHandler(payments);
  // Payment policy rule chain (ascending order):
  //   10    — GLOBAL_GUARD (reserved)
  //   20    — BlockedUserRule (users.md)
  //   30–70 — future global guards (Corporate, city, …)
  //   80    — CashRequiresAuthenticationRule
  //   90    — OnlineAllowedRule
  const paymentPolicy: IPaymentPolicy = new PaymentPolicyService([
    new BlockedUserRule(),
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

  // Admin Platform module access — second line of defense after
  // require<Role>FromRequest(). AdminFinance/AdminMarketingScopeRule run
  // before AdminFullAccessRule (order 15 < 20) and only apply to admins who
  // actually carry a scope — a plain admin's access is unaffected.
  const permissionPolicy: IPermissionPolicy = new PermissionPolicyService([
    new AdminFinanceScopeRule(),
    new AdminMarketingScopeRule(),
    new AdminFullAccessRule(),
  ]);

  // Stock policy: a single rule today (per-product threshold override, else
  // the platform default) — per-category thresholds are a documented future
  // extension (warehouse.md), not yet backed by a schema/UI.
  const stockPolicy: IStockPolicy = new StockPolicyService([new LowStockThresholdRule()]);

  // Courier assignment: MVP single rule (least-loaded available courier) —
  // exact criteria (distance, rating) is an open product question (couriers.md).
  const courierAssignmentPolicy: ICourierAssignmentPolicy = new CourierAssignmentPolicyService([
    new LeastLoadedAvailableCourierRule(),
  ]);

  // Commission: MVP single rule (flat rate, admin-overridable via Settings) —
  // per-seller/per-category rates are a documented future extension (finance.md).
  const commissionPolicy: ICommissionPolicy = new CommissionPolicyService([
    new FlatCommissionRule(),
  ]);

  // Discount: validity guard -> min-order guard -> amount computation
  // (marketing.md), the same ordered-chain shape as PaymentPolicyService.
  const discountPolicy: IDiscountPolicy = new DiscountPolicyService([
    new CouponValidityRule(),
    new CouponMinOrderRule(),
    new CouponDiscountAmountRule(),
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

  const addressService = new AddressService(addresses);
  // Reuses orderProducts — the same product repository CheckoutService
  // validates against, so a cart line and an order line item are validated
  // against identical truth (both Supabase, per ADR-002).
  const cartService = new CartService(orderProducts, carts);
  const pricing = new PricingService(zones);
  const inventory = new InventoryService(orderProducts);
  const marketplaceEvents: IMarketplaceEventBus = new MarketplaceEventsService();
  const auditLog: IAuditLog = new SupabaseAuditLog();

  const settingsService = new SettingsService(settings, marketplaceEvents);
  const analyticsService = new AnalyticsService(orders);
  const payoutService = new PayoutService(
    payouts,
    commissionPolicy,
    settingsService,
    marketplaceEvents,
  );
  const couponService = new CouponService(coupons, discountPolicy, marketplaceEvents);
  const bannerService = new BannerService(banners, marketplaceEvents);

  const automationOverviewService = new AutomationOverviewService();
  const secretPresence: IntegrationSecretPresence = {
    finikApiKeyConfigured: !!env.FINIK_API_KEY,
    telegramBotTokenConfigured: !!env.TELEGRAM_BOT_TOKEN,
    whatsappApiTokenConfigured: !!env.WHATSAPP_API_TOKEN,
  };
  const integrationsStatusService = new IntegrationsStatusService(secretPresence);
  const securityOverviewService = new SecurityOverviewService();
  const auditLogQueryService = new AuditLogQueryService(auditLog);

  // Auto-assignment orchestrator (platform-lifecycle.md §3) — needs
  // courierStatus/orders (candidates + workload) + the policy + events.
  const courierAssignmentService = new CourierAssignmentService(
    courierStatus,
    orders,
    courierAssignmentPolicy,
    marketplaceEvents,
  );

  // Buffer-as-gate for the operational cascade (platform-lifecycle.md, §3) —
  // needs orderCascades (idempotency claim) + marketplaceEvents (publish) +
  // courierAssignmentService (opportunistic (re-)assignment), so it's
  // constructed after all three exist and before adminOrderService, which
  // sweeps it on every staff-facing order read.
  const orderCascadeService = new OrderLifecycleCascadeService(
    orderCascades,
    marketplaceEvents,
    courierAssignmentService,
  );

  const adminOrderService = new AdminOrderService(
    orders,
    orderLifecycle,
    orderCascadeService,
    inventory,
    marketplaceEvents,
  );
  const warehouseOrderService = new WarehouseOrderService(
    orders,
    orderLifecycle,
    marketplaceEvents,
  );
  const courierOrderService = new CourierOrderService(
    orders,
    orderLifecycle,
    marketplaceEvents,
    courierStatus,
  );
  const courierAdminService = new CourierAdminService(courierStatus, orders);
  const courierStatusService = new CourierStatusService(courierStatus, marketplaceEvents);
  const sellerProductService = new SellerProductService(
    sellerProducts,
    productPublication,
    marketplaceEvents,
  );
  const sellerProfileService = new SellerProfileService(sellerProfiles, marketplaceEvents);
  const supplierService = new SupplierService(suppliers);
  const supplyService = new SupplyService(supplies, suppliers, inventory, marketplaceEvents);
  const userAdminService = new UserAdminService(userAdmin, marketplaceEvents);
  const categoryAdminService = new CategoryAdminService(adminCategories, marketplaceEvents);
  const stockAdminService = new StockAdminService(stock, stockPolicy, marketplaceEvents);
  const dashboardService = new DashboardService(orders, stockAdminService);

  // Customer self-cancellation releases the same reserved stock checkout took
  // and publishes order.cancelled — needs inventory/marketplaceEvents, so
  // this is constructed after both exist.
  const orderService = new OrderService(orders, orderLifecycle, inventory, marketplaceEvents);
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
    customerStatus,
    couponService,
  );

  return {
    catalogProducts,
    orderProducts,
    orders,
    orderCascades,
    orderCascadeService,
    sellerProducts,
    sellerProfiles,
    sellerProfileService,
    suppliers,
    supplierService,
    supplies,
    supplyService,
    userAdmin,
    userAdminService,
    addresses,
    carts,
    zones,
    adminCategories,
    stock,
    stockPolicy,
    stockAdminService,
    dashboardService,
    payments,
    notifications,
    orderEvents,
    checkoutPayment,
    paymentPolicy,
    orderLifecycle,
    permissionPolicy,
    settings,
    settingsService,
    analyticsService,
    commissionPolicy,
    payouts,
    payoutService,
    discountPolicy,
    coupons,
    couponService,
    banners,
    bannerService,
    automationOverviewService,
    integrationsStatusService,
    securityOverviewService,
    auditLogQueryService,
    productPublication,
    marketplaceStandards,
    marketplaceEvents,
    auditLog,
    aiWorkers,
    aiOrchestrator,
    catalog: new CatalogService(catalogProducts),
    categories: new CategoryService(categoryRepository),
    categoryAdminService,
    cartService,
    orderService,
    adminOrderService,
    warehouseOrderService,
    courierOrderService,
    courierAdminService,
    courierAssignmentPolicy,
    courierAssignmentService,
    courierStatus,
    courierStatusService,
    customerStatus,
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
