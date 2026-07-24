import { BootstrapTokens } from "@server/bootstrap/tokens";
import {
  ArchitectureLayer,
  ArchitectureNodeKind,
  createModuleDescriptor,
  createPlatformDescriptor,
  type ContractEntry,
  type DomainEventEntry,
} from "@server/platform/documentation/documentation/models";
import type { IArchitectureRegistry } from "@server/platform/documentation/documentation/contracts";

interface ModuleCatalogEntry {
  readonly id: string;
  readonly name: string;
  readonly token: symbol;
  readonly methods: readonly string[];
  readonly dependencies?: readonly string[];
  readonly kind: typeof ArchitectureNodeKind.BusinessCapabilityModule | typeof ArchitectureNodeKind.BusinessProcessModule;
}

const BCM_MODULES: readonly ModuleCatalogEntry[] = Object.freeze([
  { id: "cart", name: "Cart", token: BootstrapTokens.CartModule, methods: ["getCart", "addItem", "changeQuantity", "removeItem", "clearCart"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "favorites", name: "Favorites", token: BootstrapTokens.FavoritesModule, methods: ["listFavorites", "addFavorite", "removeFavorite", "isFavorite"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "reviews", name: "Reviews", token: BootstrapTokens.ReviewsModule, methods: ["listReviews", "createReview", "editReview", "deleteReview", "getReview"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "search", name: "Search", token: BootstrapTokens.SearchModule, methods: ["products", "categories", "sellers", "search"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "order", name: "Order", token: BootstrapTokens.OrderModule, methods: ["createOrder", "getOrder", "updateOrderStatus", "createDispute"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "payment", name: "Payment", token: BootstrapTokens.PaymentModule, methods: ["createPayment", "getPayment", "updatePaymentStatus"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "product", name: "Product", token: BootstrapTokens.ProductModule, methods: ["createProduct", "updateProduct", "publishProduct", "getProduct", "exists"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "notification", name: "Notification", token: BootstrapTokens.NotificationModule, methods: ["send", "sendOrderCreated", "sendPaymentSucceeded"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "customer", name: "Customer", token: BootstrapTokens.CustomerModule, methods: ["createCustomer", "getCustomer", "updateCustomerProfile", "createTicket"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "seller", name: "Seller", token: BootstrapTokens.SellerModule, methods: ["createSeller", "getSeller", "approveSeller", "suspendSeller"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "catalog", name: "Catalog", token: BootstrapTokens.CatalogModule, methods: ["createCategory", "updateCategory", "getCategoryTree", "isCategoryPublished"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "inventory", name: "Inventory", token: BootstrapTokens.InventoryModule, methods: ["getInventory", "reserve", "releaseReservation", "adjustQuantity"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "pricing", name: "Pricing", token: BootstrapTokens.PricingModule, methods: ["createPrice", "getCurrentPrice", "calculatePrice", "applyDiscount"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "marketplace", name: "Marketplace", token: BootstrapTokens.MarketplaceModule, methods: ["publishListing", "approveListing", "rejectListing", "getListing"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "moderation", name: "Moderation", token: BootstrapTokens.ModerationModule, methods: ["requestModeration", "approve", "reject", "cancel", "getStatus"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "support", name: "Support", token: BootstrapTokens.SupportModule, methods: ["createTicket", "reply", "close", "createComplaint", "createDispute"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "analytics", name: "Analytics", token: BootstrapTokens.AnalyticsModule, methods: ["getSalesMetrics", "getOrderMetrics", "getMarketplaceMetrics"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "administration", name: "Administration", token: BootstrapTokens.AdministrationModule, methods: ["getSystemSettings", "getMarketplaceConfiguration", "setMaintenanceMode"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "warehouse", name: "Warehouse", token: BootstrapTokens.WarehouseModule, methods: ["createTask", "assignWorker", "completeTask", "getTasksByOrder"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "courier", name: "Courier", token: BootstrapTokens.CourierModule, methods: ["createCourier", "assignCourier", "startDelivery", "completeDelivery"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "delivery", name: "Delivery", token: BootstrapTokens.DeliveryModule, methods: ["startDelivery", "createComplaint"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
  { id: "returns", name: "Returns", token: BootstrapTokens.ReturnsModule, methods: ["processReturn"], kind: ArchitectureNodeKind.BusinessCapabilityModule },
]);

const BPM_MODULES: readonly ModuleCatalogEntry[] = Object.freeze([
  {
    id: "checkout",
    name: "Checkout",
    token: BootstrapTokens.CheckoutModule,
    methods: ["createCheckout", "validateCheckout", "placeOrder", "getCheckout"],
    dependencies: ["cart", "product", "order", "payment"],
    kind: ArchitectureNodeKind.BusinessProcessModule,
  },
  {
    id: "order-fulfillment",
    name: "Order Fulfillment",
    token: BootstrapTokens.OrderFulfillmentModule,
    methods: ["fulfillOrder"],
    dependencies: ["order"],
    kind: ArchitectureNodeKind.BusinessProcessModule,
  },
]);

const PLATFORM_MODULES = Object.freeze([
  ["platform-ai", "AI Platform", "server/platform/ai", ["AIOrchestrator", "AIWorkerRegistry", "AIExecutionPlanner"]],
  ["platform-integration", "Integration Platform", "server/platform/integration", ["ProviderRegistry", "Provider Adapters"]],
  ["platform-runtime", "Runtime Platform", "server/platform/runtime", ["HealthService", "DiagnosticsService", "ApplicationLifecycle"]],
  ["platform-testing", "Testing Platform", "server/platform/testing", ["TestingPlatform", "ScenarioRunner", "FixtureFactory"]],
  ["platform-documentation", "Documentation Platform", "server/platform/documentation", ["ArchitectureRegistry", "DocumentationGenerator"]],
] as const);

const CONTRACTS: readonly ContractEntry[] = Object.freeze([
  { id: "contract-payment-provider", name: "IPaymentProvider", layer: ArchitectureLayer.Integration },
  { id: "contract-notification-provider", name: "INotificationProvider", layer: ArchitectureLayer.Integration },
  { id: "contract-storage-provider", name: "IStorageProvider", layer: ArchitectureLayer.Integration },
  { id: "contract-health-service", name: "IHealthService", layer: ArchitectureLayer.Platform },
  { id: "contract-test-scenario", name: "ITestScenario", layer: ArchitectureLayer.Platform },
  { id: "contract-architecture-registry", name: "IArchitectureRegistry", layer: ArchitectureLayer.Platform },
]);

const DOMAIN_EVENTS: readonly DomainEventEntry[] = Object.freeze([
  { id: "event-order-created", name: "OrderCreatedEvent", source: "order" },
  { id: "event-payment-completed", name: "PaymentCompletedEvent", source: "payment" },
  { id: "event-listing-published", name: "ListingPublishedEvent", source: "marketplace" },
  { id: "event-moderation-approved", name: "ModerationApprovedEvent", source: "moderation" },
  { id: "event-provider-registered", name: "ProviderRegisteredEvent", source: "integration" },
  { id: "event-application-started", name: "ApplicationStartedEvent", source: "runtime" },
  { id: "event-scenario-finished", name: "ScenarioFinishedEvent", source: "testing" },
  { id: "event-documentation-generated", name: "DocumentationGeneratedEvent", source: "documentation" },
]);

/** Registers the default marketplace architecture catalog. */
export function registerDefaultArchitectureCatalog(registry: IArchitectureRegistry): void {
  for (const module of [...BCM_MODULES, ...BPM_MODULES]) {
    registry.registerModule(
      createModuleDescriptor({
        id: module.id,
        name: module.name,
        kind: module.kind,
        layer: ArchitectureLayer.Application,
        moduleApiToken: String(module.token),
        publicMethods: module.methods,
        dependencies: module.dependencies,
      }),
    );
  }

  for (const [id, name, path, components] of PLATFORM_MODULES) {
    registry.registerPlatform(
      createPlatformDescriptor({
        id,
        name,
        path,
        components,
        dependencies: ["platform-integration"],
      }),
    );
  }

  for (const contract of CONTRACTS) {
    registry.registerContract(contract);
  }

  for (const event of DOMAIN_EVENTS) {
    registry.registerDomainEvent(event);
  }

  registry.registerDependency({
    from: "platform-documentation",
    to: "platform-integration",
    kind: "uses",
    description: "Reads ProviderRegistry metadata",
  });
  registry.registerDependency({
    from: "checkout",
    to: "platform-integration",
    kind: "uses",
    description: "Payment and notification through infrastructure bridges",
  });
}
