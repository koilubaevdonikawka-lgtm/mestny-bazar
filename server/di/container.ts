import { getServerEnv, type ServerEnv } from "@server/config/env";
import { createAiProvider, createAiImageProvider } from "@server/adapters/ai/ai-provider.factory";
import { AiTranslationService } from "@server/domain/ai-translation.service";
import type { IAiTextProvider } from "@server/ports/ai-provider.port";
import type { IAiImageProvider } from "@server/ports/ai-image-provider.port";
import { SupabaseTranslationCache } from "@server/adapters/supabase/translation-cache.repository";
import { CachedTranslationService } from "@server/domain/cached-translation.service";
import type { ITranslationCache } from "@server/ports/translation-cache.port";
import { CartService } from "@server/domain/cart.service";
import { CatalogService } from "@server/domain/catalog.service";
import { CategoryService } from "@server/domain/category.service";
import { CategoryAdminService } from "@server/domain/category-admin.service";
import { AttributeAdminService } from "@server/domain/attribute-admin.service";
import { ProductAttributeService } from "@server/domain/product-attribute.service";
import { ProductVariantService } from "@server/domain/product-variant.service";
import { VariantAttributeService } from "@server/domain/variant-attribute.service";
import { VariantStockService } from "@server/domain/variant-stock.service";
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
import { CityService } from "@server/domain/city.service";
import { DeliveryZoneService } from "@server/domain/delivery-zone.service";
import { DeliveryZoneAdminService } from "@server/domain/delivery-zone-admin.service";
import { DeliveryTariffAdminService } from "@server/domain/delivery-tariff-admin.service";
import { DeliveryCalculator } from "@server/domain/delivery-calculator";
import { DeliveryPricingEngine } from "@server/domain/delivery-pricing-engine.service";
import { DeliveryZonePolicyService } from "@server/domain/delivery-zone-policy/delivery-zone-policy.service";
import { ZoneActiveRule } from "@server/domain/delivery-zone-policy/rules/zone-active.rule";
import { MinOrderAmountRule } from "@server/domain/delivery-zone-policy/rules/min-order-amount.rule";
import { AllowRule } from "@server/domain/delivery-zone-policy/rules/allow.rule";
import { DeliveryTariffPolicyService } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy.service";
import { CorporateTariffRule } from "@server/domain/delivery-tariff-policy/rules/corporate-tariff.rule";
import { HolidayTariffRule } from "@server/domain/delivery-tariff-policy/rules/holiday-tariff.rule";
import { PromotionalTariffRule } from "@server/domain/delivery-tariff-policy/rules/promotional-tariff.rule";
import { StandardTariffFallbackRule } from "@server/domain/delivery-tariff-policy/rules/standard-tariff-fallback.rule";
import { SellerProfileService } from "@server/domain/seller-profile.service";
import { SettingsService } from "@server/domain/settings.service";
import { StockAdminService } from "@server/domain/stock-admin.service";
import { StockPolicyService } from "@server/domain/stock-policy/stock-policy.service";
import { LowStockThresholdRule } from "@server/domain/stock-policy/rules/low-stock-threshold.rule";
import { SupplierService } from "@server/domain/supplier.service";
import { SupplyService } from "@server/domain/supply.service";
import { UserAdminService } from "@server/domain/user-admin.service";
import { MediaUploadService } from "@server/domain/media-upload.service";
import { CourierProfileService } from "@server/domain/courier-profile.service";
import { RbacService } from "@server/domain/rbac.service";
import { PlatformOwnershipService } from "@server/domain/platform-ownership.service";
import { BootstrapService } from "@server/domain/bootstrap.service";
import { OwnershipTransferService } from "@server/domain/ownership-transfer.service";
import { RoleResolutionService } from "@server/domain/role-resolution.service";
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
import { createPaymentProvider } from "@server/adapters/payment/payment-provider.factory";
import { SupabasePaymentRepository } from "@server/adapters/supabase/payment.repository";
import { PaymentService } from "@server/domain/payment.service";
import type { IPaymentRepository } from "@server/ports/payment.repository";
import { SupabaseAddressRepository } from "@server/adapters/supabase/address.repository";
import { SupabaseDeviceTokenRepository } from "@server/adapters/supabase/device-token.repository";
import { SupabaseCartRepository } from "@server/adapters/supabase/cart.repository";
import { SupabaseCategoryRepository } from "@server/adapters/supabase/category.repository";
import { SupabaseAdminCategoryRepository } from "@server/adapters/supabase/category-admin.repository";
import { SupabaseAttributeRepository } from "@server/adapters/supabase/attribute.repository";
import { SupabaseProductAttributeRepository } from "@server/adapters/supabase/product-attribute.repository";
import { SupabaseProductVariantRepository } from "@server/adapters/supabase/product-variant.repository";
import { SupabaseVariantAttributeRepository } from "@server/adapters/supabase/variant-attribute.repository";
import { SupabaseVariantStockRepository } from "@server/adapters/supabase/variant-stock.repository";
import { SupabaseCourierStatusRepository } from "@server/adapters/supabase/courier-status.repository";
import { SupabaseCustomerStatusRepository } from "@server/adapters/supabase/customer-status.repository";
import { SupabaseCityRepository } from "@server/adapters/supabase/city.repository";
import type { ICityRepository } from "@server/ports/city.repository";
import { SupabaseStoreRepository } from "@server/adapters/supabase/store.repository";
import type { IStoreRepository } from "@server/ports/store.repository";
import { StoreService } from "@server/domain/store.service";
import { SupabaseDeliveryZoneRepository } from "@server/adapters/supabase/delivery-zone.repository";
import { SupabaseAdminDeliveryZoneRepository } from "@server/adapters/supabase/delivery-zone-admin.repository";
import { SupabaseDeliveryTariffRepository } from "@server/adapters/supabase/delivery-tariff.repository";
import type { IAdminDeliveryZoneRepository } from "@server/ports/delivery-zone-admin.repository";
import type { IDeliveryTariffRepository } from "@server/ports/delivery-tariff.repository";
import type { IDeliveryZonePolicy } from "@server/ports/delivery-zone-policy.port";
import type { IDeliveryTariffPolicy } from "@server/ports/delivery-tariff-policy.port";
import type { IDeliveryPricingEngine } from "@server/ports/delivery-pricing-engine.port";
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
import { SupabasePlatformOwnershipRepository } from "@server/adapters/supabase/platform-ownership.repository";
import { SupabaseBootstrapRepository } from "@server/adapters/supabase/bootstrap.repository";
import { SupabaseStorageAdapter } from "@server/adapters/supabase/storage.service";
import { SupabaseCourierProfileRepository } from "@server/adapters/supabase/courier-profile.repository";
import { SupabaseRbacRepository } from "@server/adapters/supabase/rbac.repository";
import type { IAddressRepository } from "@server/ports/address.repository";
import type { IDeviceTokenRepository } from "@server/ports/device-token.repository";
import type { ICartRepository } from "@server/ports/cart.repository";
import type { ICategoryRepository } from "@server/ports/category.repository";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import type { IAttributeRepository } from "@server/ports/attribute.repository";
import type { IProductAttributeRepository } from "@server/ports/product-attribute.repository";
import type { IProductVariantRepository } from "@server/ports/product-variant.repository";
import type { IVariantAttributeRepository } from "@server/ports/variant-attribute.repository";
import type { IVariantStockRepository } from "@server/ports/variant-stock.repository";
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
import type { IPlatformOwnershipRepository } from "@server/ports/platform-ownership.repository";
import type { IBootstrapRepository } from "@server/ports/bootstrap.repository";
import type { IStorageService } from "@server/ports/storage.service";
import type { ICourierProfileRepository } from "@server/ports/courier-profile.repository";
import type { IRbacRepository } from "@server/ports/rbac.repository";
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
import { PaymentConfirmedRule } from "@server/domain/order-lifecycle/rules/payment-confirmed.rule";
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
import { DeviceTokenService } from "@server/domain/device-token.service";
import { AdminOrderService } from "@server/domain/admin-order.service";
import { WarehouseOrderService } from "@server/domain/warehouse-order.service";
import { CourierOrderService } from "@server/domain/courier-order.service";
import { SellerProductService } from "@server/domain/seller-product.service";
import { ProductPublicationService } from "@server/domain/product-publication/product-publication.service";
import { BootstrapDraftRule } from "@server/domain/product-publication/rules/bootstrap-draft.rule";
import { SellerPublishRule } from "@server/domain/product-publication/rules/seller-publish.rule";
import { SellerHideRule } from "@server/domain/product-publication/rules/seller-hide.rule";
import { AdminFullControlRule } from "@server/domain/product-publication/rules/admin-full-control.rule";
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
  attributes: IAttributeRepository;
  productAttributes: IProductAttributeRepository;
  attributeAdminService: AttributeAdminService;
  productAttributeService: ProductAttributeService;
  productVariants: IProductVariantRepository;
  variantAttributes: IVariantAttributeRepository;
  productVariantService: ProductVariantService;
  variantAttributeService: VariantAttributeService;
  variantStock: IVariantStockRepository;
  variantStockService: VariantStockService;
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
  platformOwnership: IPlatformOwnershipRepository;
  platformOwnershipService: PlatformOwnershipService;
  bootstrapRepo: IBootstrapRepository;
  bootstrapService: BootstrapService;
  ownershipTransferService: OwnershipTransferService;
  roleResolutionService: RoleResolutionService;
  addressService: AddressService;
  deviceTokenService: DeviceTokenService;
  notificationService: NotificationService;
  notificationCenter: INotificationCenter;
  catalogProducts: IProductRepository;
  orderProducts: IProductRepository;
  orders: IOrderRepository;
  orderCascades: IOrderCascadeRepository;
  orderCascadeService: OrderLifecycleCascadeService;
  sellerProducts: ISellerProductRepository;
  addresses: IAddressRepository;
  deviceTokens: IDeviceTokenRepository;
  cities: ICityRepository;
  cityService: CityService;
  stores: IStoreRepository;
  storeService: StoreService;
  zones: IDeliveryZoneRepository;
  adminZones: IAdminDeliveryZoneRepository;
  deliveryTariffs: IDeliveryTariffRepository;
  deliveryZonePolicy: IDeliveryZonePolicy;
  deliveryTariffPolicy: IDeliveryTariffPolicy;
  deliveryPricingEngine: IDeliveryPricingEngine;
  deliveryZoneService: DeliveryZoneService;
  deliveryZoneAdminService: DeliveryZoneAdminService;
  deliveryTariffAdminService: DeliveryTariffAdminService;
  adminCategories: IAdminCategoryRepository;
  stock: IStockRepository;
  stockPolicy: IStockPolicy;
  stockAdminService: StockAdminService;
  dashboardService: DashboardService;
  payments: IPaymentProvider;
  paymentRepository: IPaymentRepository;
  paymentService: PaymentService;
  checkoutPayment: ICheckoutPaymentHandler;
  paymentPolicy: IPaymentPolicy;
  orderLifecycle: IOrderLifecyclePolicy;
  productPublication: IProductPublicationPolicy;
  marketplaceStandards: IMarketplaceStandards;
  marketplaceEvents: IMarketplaceEventBus;
  auditLog: IAuditLog;
  aiWorkers: AIWorkerRegistry;
  aiOrchestrator: AIOrchestrator;
  aiProvider: IAiTextProvider;
  aiTranslationService: AiTranslationService;
  translationCache: ITranslationCache;
  cachedTranslationService: CachedTranslationService;
  aiImageProvider: IAiImageProvider;
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
  categoryImageStorage: IStorageService;
  mediaStorage: IStorageService;
  mediaUploadService: MediaUploadService;
  courierProfiles: ICourierProfileRepository;
  courierProfileService: CourierProfileService;
  rbacRepository: IRbacRepository;
  rbacService: RbacService;
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
  const courierProfiles: ICourierProfileRepository = new SupabaseCourierProfileRepository();
  const customerStatus: ICustomerStatusRepository = new SupabaseCustomerStatusRepository();
  const userAdmin: IUserAdminRepository = new SupabaseUserAdminRepository();
  const rbacRepository: IRbacRepository = new SupabaseRbacRepository();
  // Unified image upload (Промпт №068) — category-images bucket stays as-is
  // (categories keep writing there); everything else (products, banners,
  // courier photos) goes into the new marketplace-media bucket, prefixed by
  // context. One IStorageService instance per bucket, same port shape.
  const categoryImageStorage: IStorageService = new SupabaseStorageAdapter("category-images");
  const mediaStorage: IStorageService = new SupabaseStorageAdapter("marketplace-media");
  // Промпт №101: product photos are background-removed via the same AI
  // provider factory as text translation (createAiImageProvider mirrors
  // createAiProvider exactly) — no separate image-processing mechanism.
  const aiImageProvider: IAiImageProvider = createAiImageProvider(env);
  const mediaUploadService = new MediaUploadService(
    categoryImageStorage,
    mediaStorage,
    aiImageProvider,
  );
  const platformOwnership: IPlatformOwnershipRepository = new SupabasePlatformOwnershipRepository();
  const bootstrapRepo: IBootstrapRepository = new SupabaseBootstrapRepository();
  const addresses = new SupabaseAddressRepository();
  const deviceTokens = new SupabaseDeviceTokenRepository();
  const carts = new SupabaseCartRepository();
  const settings: ISettingsRepository = new SupabaseSettingsRepository();
  const cities: ICityRepository = new SupabaseCityRepository();
  const stores: IStoreRepository = new SupabaseStoreRepository();
  const zones = new SupabaseDeliveryZoneRepository();
  const adminZones: IAdminDeliveryZoneRepository = new SupabaseAdminDeliveryZoneRepository();
  const deliveryTariffs: IDeliveryTariffRepository = new SupabaseDeliveryTariffRepository();
  const categoryRepository: ICategoryRepository = new SupabaseCategoryRepository();
  const adminCategories: IAdminCategoryRepository = new SupabaseAdminCategoryRepository();
  const attributes: IAttributeRepository = new SupabaseAttributeRepository();
  const productAttributes: IProductAttributeRepository = new SupabaseProductAttributeRepository();
  const productVariants: IProductVariantRepository = new SupabaseProductVariantRepository();
  const variantAttributes: IVariantAttributeRepository = new SupabaseVariantAttributeRepository();
  const variantStock: IVariantStockRepository = new SupabaseVariantStockRepository();
  const stock: IStockRepository = new SupabaseStockRepository();
  const coupons: ICouponRepository = new SupabaseCouponRepository();
  const payouts: IPayoutRepository = new SupabasePayoutRepository();
  const banners: IBannerRepository = new SupabaseBannerRepository();
  // Real Finik integration only when every credential is configured, else a
  // safe non-throwing stub — see payment-provider.factory.ts.
  const payments = createPaymentProvider(env);
  const paymentRepository: IPaymentRepository = new SupabasePaymentRepository();
  const notifications = new StubNotificationAdapter();
  const orderEvents = new StubOrderEventNotifier(notifications);
  // checkoutPayment/paymentService are constructed further below, once
  // orderService exists (PaymentService needs it to confirm payment on a
  // webhook-verified order).
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
    new PaymentConfirmedRule(),
  ]);

  // Product publication: seller create + publish/hide transitions.
  const productPublication: IProductPublicationPolicy = new ProductPublicationService([
    new SellerPublishRule(),
    new SellerHideRule(),
    new BootstrapDraftRule(),
    new AdminFullControlRule(),
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
  // Constructed here (moved earlier than productAttributeService/
  // productVariantService below) — adminOrderService (Stage 21) needs it
  // for release-on-cancel, and dependency order requires this to exist
  // before that construction runs.
  const variantStockService = new VariantStockService(variantStock, productVariants, stockPolicy);

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
  const deviceTokenService = new DeviceTokenService(deviceTokens);
  // Reuses orderProducts — the same product repository CheckoutService
  // validates against, so a cart line and an order line item are validated
  // against identical truth (both Supabase, per ADR-002).
  const cartService = new CartService(orderProducts, carts);
  // Delivery Rule Engines (docs/delivery/delivery-rule-engine.md) — Tariff
  // Policy runs before Zone Policy: MinOrderAmountRule needs a resolved
  // tariff's minOrderAmount, which does not exist before a tariff is chosen
  // (see DeliveryPricingEngine's own doc comment for the full explanation).
  const deliveryTariffPolicy: IDeliveryTariffPolicy = new DeliveryTariffPolicyService([
    new CorporateTariffRule(),
    new HolidayTariffRule(),
    new PromotionalTariffRule(),
    new StandardTariffFallbackRule(),
  ]);
  const deliveryZonePolicy: IDeliveryZonePolicy = new DeliveryZonePolicyService([
    new ZoneActiveRule(),
    new MinOrderAmountRule(),
    new AllowRule(),
  ]);
  const deliveryPricingEngine: IDeliveryPricingEngine = new DeliveryPricingEngine(
    zones,
    deliveryTariffs,
    deliveryTariffPolicy,
    deliveryZonePolicy,
    new DeliveryCalculator(),
  );
  const deliveryZoneService = new DeliveryZoneService(zones);
  const cityService = new CityService(cities);

  const pricing = new PricingService(deliveryPricingEngine);
  const inventory = new InventoryService(orderProducts);
  const marketplaceEvents: IMarketplaceEventBus = new MarketplaceEventsService();
  const auditLog: IAuditLog = new SupabaseAuditLog();
  const deliveryZoneAdminService = new DeliveryZoneAdminService(adminZones, marketplaceEvents);
  const storeService = new StoreService(stores, marketplaceEvents);
  const deliveryTariffAdminService = new DeliveryTariffAdminService(
    deliveryTariffs,
    marketplaceEvents,
  );

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
    // FINIK_MERCHANT_ID excluded — not confirmed by official documentation
    // (Промпт №079), matches payment-provider.factory.ts's own gate.
    finikApiKeyConfigured: !!(
      env.FINIK_API_KEY &&
      env.FINIK_RSA_PRIVATE_KEY &&
      env.FINIK_WEBHOOK_PUBLIC_KEY &&
      env.FINIK_ENVIRONMENT
    ),
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
    courierProfiles,
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
    variantStockService,
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
  const courierAdminService = new CourierAdminService(courierStatus, orders, courierProfiles);
  const courierStatusService = new CourierStatusService(courierStatus, marketplaceEvents);
  const courierProfileService = new CourierProfileService(
    courierProfiles,
    userAdmin,
    marketplaceEvents,
  );
  const rbacService = new RbacService(rbacRepository, marketplaceEvents);
  const sellerProductService = new SellerProductService(
    sellerProducts,
    adminCategories,
    productPublication,
    marketplaceEvents,
  );
  const sellerProfileService = new SellerProfileService(sellerProfiles, marketplaceEvents);
  const supplierService = new SupplierService(suppliers);
  const supplyService = new SupplyService(supplies, suppliers, inventory, marketplaceEvents);
  const userAdminService = new UserAdminService(userAdmin, marketplaceEvents);
  const platformOwnershipService = new PlatformOwnershipService(platformOwnership);
  const bootstrapService = new BootstrapService(platformOwnershipService, bootstrapRepo);
  const ownershipTransferService = new OwnershipTransferService(
    platformOwnership,
    marketplaceEvents,
  );
  const roleResolutionService = new RoleResolutionService(platformOwnershipService);
  const categoryAdminService = new CategoryAdminService(adminCategories, marketplaceEvents);
  const attributeAdminService = new AttributeAdminService(attributes, adminCategories);
  const productAttributeService = new ProductAttributeService(productAttributes, attributes);
  const productVariantService = new ProductVariantService(productVariants, sellerProducts);
  const variantAttributeService = new VariantAttributeService(variantAttributes, attributes);
  const stockAdminService = new StockAdminService(
    stock,
    stockPolicy,
    marketplaceEvents,
    inventory,
    suppliers,
  );
  const dashboardService = new DashboardService(orders, stockAdminService);

  // Customer self-cancellation releases the same reserved stock checkout took
  // and publishes order.cancelled — needs inventory/marketplaceEvents, so
  // this is constructed after both exist.
  const orderService = new OrderService(orders, orderLifecycle, inventory, marketplaceEvents);
  // PaymentService needs orderService (confirms payment -> transitions the
  // order to PAID on a webhook-verified event) — constructed here, once it
  // exists. appUrl backs the provider return-URL (Промпт №075 item 4).
  const paymentService = new PaymentService(
    paymentRepository,
    payments,
    orderService,
    marketplaceEvents,
    env.APP_URL ?? "https://mesnyibazar.com",
  );
  const checkoutPayment: ICheckoutPaymentHandler = new CheckoutPaymentHandler(paymentService);
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
  // Separate from aiWorkers/aiOrchestrator above (rule-based catalog/media
  // analysis, event-driven) — this is the universal, provider-agnostic AI
  // text-translation infrastructure (Промпт №088). No real provider is
  // registered yet; createAiProvider() always returns the safe stub today.
  const aiProvider: IAiTextProvider = createAiProvider(env);
  const aiTranslationService = new AiTranslationService(aiProvider);
  // Persistent cache in front of aiTranslationService (Промпт №094) —
  // aiTranslationService itself is unmodified and still constructible/usable
  // on its own; this wraps it, it does not replace it in the container.
  const translationCache: ITranslationCache = new SupabaseTranslationCache();
  const cachedTranslationService = new CachedTranslationService(
    translationCache,
    aiTranslationService,
  );
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
    productVariantService,
    variantStockService,
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
    platformOwnership,
    platformOwnershipService,
    bootstrapRepo,
    bootstrapService,
    ownershipTransferService,
    roleResolutionService,
    addresses,
    carts,
    cities,
    cityService,
    stores,
    storeService,
    zones,
    adminZones,
    deliveryTariffs,
    deliveryZonePolicy,
    deliveryTariffPolicy,
    deliveryPricingEngine,
    deliveryZoneService,
    deliveryZoneAdminService,
    deliveryTariffAdminService,
    adminCategories,
    stock,
    stockPolicy,
    stockAdminService,
    dashboardService,
    payments,
    paymentRepository,
    paymentService,
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
    aiProvider,
    aiTranslationService,
    translationCache,
    cachedTranslationService,
    catalog: new CatalogService(catalogProducts, categoryRepository),
    categories: new CategoryService(categoryRepository),
    categoryAdminService,
    attributes,
    productAttributes,
    attributeAdminService,
    productAttributeService,
    productVariants,
    variantAttributes,
    productVariantService,
    variantAttributeService,
    variantStock,
    variantStockService,
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
    deviceTokens,
    deviceTokenService,
    notificationService,
    notificationCenter,
    checkout,
    categoryImageStorage,
    mediaStorage,
    aiImageProvider,
    mediaUploadService,
    courierProfiles,
    courierProfileService,
    rbacRepository,
    rbacService,
  };
}

export function getServices(): ServiceContainer {
  if (!container) {
    container = createServices(getServerEnv());
  }
  return container;
}
