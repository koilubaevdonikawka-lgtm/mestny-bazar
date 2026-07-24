import {
  CartController,
  createCartRoutes,
} from "@server/api/modules/cart";
import {
  CheckoutController,
  createCheckoutRoutes,
} from "@server/api/modules/checkout";
import {
  FavoritesController,
  createFavoritesRoutes,
} from "@server/api/modules/favorites";
import {
  ReviewController,
  createReviewRoutes,
} from "@server/api/modules/reviews";
import {
  SearchController,
  createSearchRoutes,
} from "@server/api/modules/search";
import { createMarketplaceModulesRoutes } from "@server/api/modules/routing";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import {
  CartModule,
  CartService,
  CheckoutModule,
  CheckoutService,
  FavoritesModule,
  FavoritesService,
  ReviewsModule,
  ReviewService,
  SearchModule,
  SearchService,
  CheckoutProcess,
  InMemoryCheckoutSessionStore,
  OrderModule,
  OrderService,
  PaymentModule,
  PaymentService,
  ProductModule,
  ProductService,
  NotificationModule,
  NotificationService,
  OrderFulfillmentModule,
  OrderFulfillmentProcess,
  OrderFulfillmentService,
  DeliveryModule,
  DeliveryProcess,
  DeliveryService,
  ReturnsModule,
  ReturnsProcess,
  ReturnsService,
  WarehouseModule,
  WarehouseService,
  CourierModule,
  CourierService,
  CustomerModule,
  CustomerService,
  SellerModule,
  SellerService,
  CatalogModule,
  CatalogService,
  InventoryModule,
  InventoryService,
  PricingModule,
  PricingService,
  MarketplaceModule,
  MarketplaceService,
  ModerationModule,
  ModerationService,
  SupportModule,
  SupportService,
  AnalyticsModule,
  AnalyticsService,
  AdministrationModule,
  AdministrationService,
} from "@server/application/modules";
import type { IAnalyticsStore } from "@server/application/modules/analytics";
import type { IAdministrationStore } from "@server/application/modules/administration";
import type { ICartStore } from "@server/application/modules/cart";
import type { IFavoritesStore } from "@server/application/modules/favorites";
import type { IOrderStore } from "@server/application/modules/order";
import type { IOrderStatusChangeHook } from "@server/application/modules/order/order/contracts/order-status-change-hook.contract";
import type { IPaymentGateway, IPaymentStore } from "@server/application/modules/payment";
import type { IProductStore } from "@server/application/modules/product";
import type { INotificationProvider } from "@server/application/modules/notification";
import type { IWarehouseStore } from "@server/application/modules/warehouse";
import type { ICourierStore } from "@server/application/modules/courier";
import type { ICustomerStore } from "@server/application/modules/customer";
import type { ISellerStore } from "@server/application/modules/seller";
import type { ICatalogStore } from "@server/application/modules/catalog";
import type { IInventoryStore } from "@server/application/modules/inventory";
import type { IPricingStore } from "@server/application/modules/pricing";
import type { IMarketplaceStore } from "@server/application/modules/marketplace";
import type { IModerationStore } from "@server/application/modules/moderation";
import type { ISupportStore } from "@server/application/modules/support";
import type { IReviewStore } from "@server/application/modules/reviews";
import type { ISearchCatalogProvider } from "@server/application/modules/search";
import type { IIdGenerator, IProductRepository } from "@server/application/ports";
import type { ServiceProvider, ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { ApiRouteDefinition } from "@server/api/server/api.types";
import { MarketplacePublicationPolicy } from "@server/application/modules/marketplace/marketplace/policies";
import {
  registerAnalyticsEventWiring,
  wrapCustomerServiceForAnalytics,
  wrapMarketplaceServiceForAnalytics,
  wrapOrderServiceForAnalytics,
  wrapPaymentServiceForAnalytics,
  wrapProductServiceForAnalytics,
  wrapSellerServiceForAnalytics,
} from "@server/infrastructure/analytics/bootstrap/analytics-event-wiring.bootstrap";
import type { CapabilityEventPublisher } from "@server/infrastructure/analytics/capability-event-publisher";

/** Registers marketplace module services, controllers, and route factories. */
export function registerMarketplaceModules(registry: ServiceRegistry): void {
  registerAnalyticsEventWiring(registry);

  registry.registerSingleton(
    BootstrapTokens.AnalyticsService,
    (provider) =>
      new AnalyticsService(
        provider.resolve<IAnalyticsStore>(InfrastructureTokens.AnalyticsStore),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.AnalyticsModule,
    (provider) =>
      new AnalyticsModule(provider.resolve<AnalyticsService>(BootstrapTokens.AnalyticsService)),
  );

  registry.registerSingleton(
    BootstrapTokens.CartService,
    (provider) =>
      new CartService(
        provider.resolve<ICartStore>(InfrastructureTokens.CartStore),
        provider.resolve<IProductRepository>(InfrastructureTokens.ProductRepository),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.CartModule,
    (provider) => new CartModule(provider.resolve<CartService>(BootstrapTokens.CartService)),
  );

  registry.registerSingleton(
    BootstrapTokens.OrderService,
    (provider) => {
      const inner = new OrderService(
        provider.resolve<IOrderStore>(InfrastructureTokens.OrderStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<IOrderStatusChangeHook>(InfrastructureTokens.OrderStatusChangeHook),
      );
      return wrapOrderServiceForAnalytics(
        inner,
        provider.resolve<CapabilityEventPublisher>(InfrastructureTokens.CapabilityEventPublisher),
      );
    },
  );

  registry.registerSingleton(
    BootstrapTokens.PaymentService,
    (provider) => {
      const inner = new PaymentService(
        provider.resolve<IPaymentStore>(InfrastructureTokens.PaymentStore),
        provider.resolve<IPaymentGateway>(InfrastructureTokens.PaymentGateway),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      );
      return wrapPaymentServiceForAnalytics(
        inner,
        provider.resolve<CapabilityEventPublisher>(InfrastructureTokens.CapabilityEventPublisher),
      );
    },
  );

  registry.registerSingleton(
    BootstrapTokens.PaymentModule,
    (provider) =>
      new PaymentModule(provider.resolve<PaymentService>(BootstrapTokens.PaymentService)),
  );

  registry.registerSingleton(
    BootstrapTokens.ModerationService,
    (provider) =>
      new ModerationService(
        provider.resolve<IModerationStore>(InfrastructureTokens.ModerationStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider,
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.ModerationModule,
    (provider) =>
      new ModerationModule(
        provider.resolve<ModerationService>(BootstrapTokens.ModerationService),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.SupportService,
    (provider) =>
      new SupportService(
        provider.resolve<ISupportStore>(InfrastructureTokens.SupportStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<ModerationModule>(BootstrapTokens.ModerationModule),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.SupportModule,
    (provider) =>
      new SupportModule(provider.resolve<SupportService>(BootstrapTokens.SupportService)),
  );

  registry.registerSingleton(
    BootstrapTokens.OrderModule,
    (provider) =>
      new OrderModule(
        provider.resolve<OrderService>(BootstrapTokens.OrderService),
        provider.resolve<SupportModule>(BootstrapTokens.SupportModule),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.SellerService,
    (provider) => {
      const inner = new SellerService(
        provider.resolve<ISellerStore>(InfrastructureTokens.SellerStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<ModerationModule>(BootstrapTokens.ModerationModule),
      );
      return wrapSellerServiceForAnalytics(
        inner,
        provider.resolve<CapabilityEventPublisher>(InfrastructureTokens.CapabilityEventPublisher),
      );
    },
  );

  registry.registerSingleton(
    BootstrapTokens.SellerModule,
    (provider) =>
      new SellerModule(
        provider.resolve<SellerService>(BootstrapTokens.SellerService),
        provider.resolve<SupportModule>(BootstrapTokens.SupportModule),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.CatalogService,
    (provider) =>
      new CatalogService(
        provider.resolve<ICatalogStore>(InfrastructureTokens.CatalogStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.CatalogModule,
    (provider) =>
      new CatalogModule(provider.resolve<CatalogService>(BootstrapTokens.CatalogService)),
  );

  registry.registerSingleton(
    BootstrapTokens.InventoryService,
    (provider) =>
      new InventoryService(
        provider.resolve<IInventoryStore>(InfrastructureTokens.InventoryStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.InventoryModule,
    (provider) =>
      new InventoryModule(provider.resolve<InventoryService>(BootstrapTokens.InventoryService)),
  );

  registry.registerSingleton(
    BootstrapTokens.PricingService,
    (provider) =>
      new PricingService(
        provider.resolve<IPricingStore>(InfrastructureTokens.PricingStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.PricingModule,
    (provider) =>
      new PricingModule(provider.resolve<PricingService>(BootstrapTokens.PricingService)),
  );

  registry.registerSingleton(
    BootstrapTokens.MarketplaceService,
    (provider) => {
      const inner = new MarketplaceService(
        provider.resolve<IMarketplaceStore>(InfrastructureTokens.MarketplaceStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        new MarketplacePublicationPolicy(provider),
        provider.resolve<ModerationModule>(BootstrapTokens.ModerationModule),
      );
      return wrapMarketplaceServiceForAnalytics(
        inner,
        provider.resolve<CapabilityEventPublisher>(InfrastructureTokens.CapabilityEventPublisher),
      );
    },
  );

  registry.registerSingleton(
    BootstrapTokens.MarketplaceModule,
    (provider) =>
      new MarketplaceModule(
        provider.resolve<MarketplaceService>(BootstrapTokens.MarketplaceService),
        provider.resolve<SupportModule>(BootstrapTokens.SupportModule),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.ProductService,
    (provider) => {
      const inner = new ProductService(
        provider.resolve<IProductStore>(InfrastructureTokens.ProductStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<SellerModule>(BootstrapTokens.SellerModule),
        provider.resolve<CatalogModule>(BootstrapTokens.CatalogModule),
        provider.resolve<InventoryModule>(BootstrapTokens.InventoryModule),
        provider.resolve<PricingModule>(BootstrapTokens.PricingModule),
      );
      return wrapProductServiceForAnalytics(
        inner,
        provider.resolve<CapabilityEventPublisher>(InfrastructureTokens.CapabilityEventPublisher),
      );
    },
  );

  registry.registerSingleton(
    BootstrapTokens.ProductModule,
    (provider) =>
      new ProductModule(
        provider.resolve<ProductService>(BootstrapTokens.ProductService),
        provider.resolve<MarketplaceModule>(BootstrapTokens.MarketplaceModule),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.NotificationService,
    (provider) =>
      new NotificationService(
        provider.resolve<INotificationProvider>(InfrastructureTokens.NotificationModuleProvider),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.NotificationModule,
    (provider) =>
      new NotificationModule(
        provider.resolve<NotificationService>(BootstrapTokens.NotificationService),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.WarehouseService,
    (provider) =>
      new WarehouseService(
        provider.resolve<IWarehouseStore>(InfrastructureTokens.WarehouseStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.WarehouseModule,
    (provider) =>
      new WarehouseModule(provider.resolve<WarehouseService>(BootstrapTokens.WarehouseService)),
  );

  registry.registerSingleton(
    BootstrapTokens.CourierService,
    (provider) =>
      new CourierService(
        provider.resolve<ICourierStore>(InfrastructureTokens.CourierStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.CourierModule,
    (provider) =>
      new CourierModule(provider.resolve<CourierService>(BootstrapTokens.CourierService)),
  );

  registry.registerSingleton(
    BootstrapTokens.CustomerService,
    (provider) => {
      const inner = new CustomerService(
        provider.resolve<ICustomerStore>(InfrastructureTokens.CustomerStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      );
      return wrapCustomerServiceForAnalytics(
        inner,
        provider.resolve<CapabilityEventPublisher>(InfrastructureTokens.CapabilityEventPublisher),
      );
    },
  );

  registry.registerSingleton(
    BootstrapTokens.CustomerModule,
    (provider) =>
      new CustomerModule(
        provider.resolve<CustomerService>(BootstrapTokens.CustomerService),
        provider.resolve<SupportModule>(BootstrapTokens.SupportModule),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.OrderFulfillmentService,
    (provider) => {
      const process = new OrderFulfillmentProcess(
        provider.resolve<OrderModule>(BootstrapTokens.OrderModule),
        provider.resolve<PaymentModule>(BootstrapTokens.PaymentModule),
        provider.resolve<InventoryModule>(BootstrapTokens.InventoryModule),
        provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
        provider.resolve<WarehouseModule>(BootstrapTokens.WarehouseModule),
      );

      return new OrderFulfillmentService(process);
    },
  );

  registry.registerSingleton(
    BootstrapTokens.OrderFulfillmentModule,
    (provider) =>
      new OrderFulfillmentModule(
        provider.resolve<OrderFulfillmentService>(BootstrapTokens.OrderFulfillmentService),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.DeliveryService,
    (provider) => {
      const process = new DeliveryProcess(
        provider.resolve<OrderModule>(BootstrapTokens.OrderModule),
        provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
        provider.resolve<CourierModule>(BootstrapTokens.CourierModule),
      );

      return new DeliveryService(process);
    },
  );

  registry.registerSingleton(
    BootstrapTokens.DeliveryModule,
    (provider) =>
      new DeliveryModule(
        provider.resolve<DeliveryService>(BootstrapTokens.DeliveryService),
        provider.resolve<SupportModule>(BootstrapTokens.SupportModule),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.ReturnsService,
    (provider) => {
      const process = new ReturnsProcess(
        provider.resolve<OrderModule>(BootstrapTokens.OrderModule),
        provider.resolve<InventoryModule>(BootstrapTokens.InventoryModule),
        provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
      );

      return new ReturnsService(process);
    },
  );

  registry.registerSingleton(
    BootstrapTokens.ReturnsModule,
    (provider) =>
      new ReturnsModule(provider.resolve<ReturnsService>(BootstrapTokens.ReturnsService)),
  );

  registry.registerSingleton(
    BootstrapTokens.CheckoutService,
    (provider) => {
      const cartModule = provider.resolve<CartModule>(BootstrapTokens.CartModule);
      const process = new CheckoutProcess(
        cartModule,
        provider.resolve<ProductModule>(BootstrapTokens.ProductModule),
        provider.resolve<PricingModule>(BootstrapTokens.PricingModule),
        provider.resolve<OrderModule>(BootstrapTokens.OrderModule),
        provider.resolve<PaymentModule>(BootstrapTokens.PaymentModule),
        provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
        provider.resolve<CustomerModule>(BootstrapTokens.CustomerModule),
      );

      return new CheckoutService(
        new InMemoryCheckoutSessionStore(),
        process,
        cartModule,
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      );
    },
  );

  registry.registerSingleton(
    BootstrapTokens.CheckoutModule,
    (provider) => new CheckoutModule(provider.resolve<CheckoutService>(BootstrapTokens.CheckoutService)),
  );

  registry.registerSingleton(
    BootstrapTokens.FavoritesService,
    (provider) =>
      new FavoritesService(
        provider.resolve<IFavoritesStore>(InfrastructureTokens.FavoritesStore),
        provider.resolve<IProductRepository>(InfrastructureTokens.ProductRepository),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.FavoritesModule,
    (provider) =>
      new FavoritesModule(provider.resolve<FavoritesService>(BootstrapTokens.FavoritesService)),
  );

  registry.registerSingleton(
    BootstrapTokens.ReviewService,
    (provider) =>
      new ReviewService(
        provider.resolve<IReviewStore>(InfrastructureTokens.ReviewStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<IProductRepository>(InfrastructureTokens.ProductRepository),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.ReviewsModule,
    (provider) => new ReviewsModule(provider.resolve<ReviewService>(BootstrapTokens.ReviewService)),
  );

  registry.registerSingleton(
    BootstrapTokens.SearchService,
    (provider) =>
      new SearchService(
        provider.resolve<ISearchCatalogProvider>(InfrastructureTokens.SearchCatalogProvider),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.SearchModule,
    (provider) => new SearchModule(provider.resolve<SearchService>(BootstrapTokens.SearchService)),
  );

  registry.registerSingleton(
    BootstrapTokens.AdministrationService,
    (provider) =>
      new AdministrationService(
        provider.resolve<IAdministrationStore>(InfrastructureTokens.AdministrationStore),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<MarketplaceModule>(BootstrapTokens.MarketplaceModule),
        provider.resolve<ModerationModule>(BootstrapTokens.ModerationModule),
        provider.resolve<SupportModule>(BootstrapTokens.SupportModule),
        provider.resolve<AnalyticsModule>(BootstrapTokens.AnalyticsModule),
        provider.resolve<CustomerModule>(BootstrapTokens.CustomerModule),
        provider.resolve<SellerModule>(BootstrapTokens.SellerModule),
        provider.resolve<OrderModule>(BootstrapTokens.OrderModule),
        provider.resolve<PaymentModule>(BootstrapTokens.PaymentModule),
        provider.resolve<InventoryModule>(BootstrapTokens.InventoryModule),
        provider.resolve<PricingModule>(BootstrapTokens.PricingModule),
      ),
  );

  registry.registerSingleton(
    BootstrapTokens.AdministrationModule,
    (provider) =>
      new AdministrationModule(
        provider.resolve<AdministrationService>(BootstrapTokens.AdministrationService),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.CartController,
    (provider) => new CartController(provider.resolve<CartModule>(BootstrapTokens.CartModule)),
  );

  registry.registerTransient(
    BootstrapTokens.CheckoutController,
    (provider) =>
      new CheckoutController(provider.resolve<CheckoutModule>(BootstrapTokens.CheckoutModule)),
  );

  registry.registerTransient(
    BootstrapTokens.FavoritesController,
    (provider) =>
      new FavoritesController(
        provider.resolve<FavoritesModule>(BootstrapTokens.FavoritesModule),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.ReviewController,
    (provider) =>
      new ReviewController(provider.resolve<ReviewsModule>(BootstrapTokens.ReviewsModule)),
  );

  registry.registerTransient(
    BootstrapTokens.SearchController,
    (provider) =>
      new SearchController(provider.resolve<SearchModule>(BootstrapTokens.SearchModule)),
  );

  registry.registerSingleton(BootstrapTokens.MarketplaceModulesRoutes, (provider) =>
    createMarketplaceModulesRoutes({
      cart: provider.resolve(BootstrapTokens.CartController),
      checkout: provider.resolve(BootstrapTokens.CheckoutController),
      favorites: provider.resolve(BootstrapTokens.FavoritesController),
      reviews: provider.resolve(BootstrapTokens.ReviewController),
      search: provider.resolve(BootstrapTokens.SearchController),
    }),
  );
}

/** Resolves marketplace module routes from a configured service provider. */
export function resolveMarketplaceModulesRoutes(provider: ServiceProvider): ApiRouteDefinition[] {
  return provider.resolve(BootstrapTokens.MarketplaceModulesRoutes);
}

export {
  CartController,
  createCartRoutes,
  CheckoutController,
  createCheckoutRoutes,
  FavoritesController,
  createFavoritesRoutes,
  ReviewController,
  createReviewRoutes,
  SearchController,
  createSearchRoutes,
  createMarketplaceModulesRoutes,
};
