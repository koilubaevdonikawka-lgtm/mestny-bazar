import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { IDiagnosticsService } from "@server/platform/runtime/runtime/contracts";
import type {
  DiagnosticsReport,
  MemoryUsageSnapshot,
  RegisteredModuleSnapshot,
} from "@server/platform/runtime/runtime/models";
import type { ServiceProvider, ServiceRegistry } from "@server/infrastructure/di/service-container";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { ProviderRegistry } from "@server/platform/integration/integration";
import type { AIWorkerRegistry } from "@server/platform/ai/ai/registry";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";

const REGISTERED_BCM_MODULES: readonly { id: string; token: symbol }[] = Object.freeze([
  { id: "cart", token: BootstrapTokens.CartModule },
  { id: "checkout", token: BootstrapTokens.CheckoutModule },
  { id: "favorites", token: BootstrapTokens.FavoritesModule },
  { id: "reviews", token: BootstrapTokens.ReviewsModule },
  { id: "search", token: BootstrapTokens.SearchModule },
  { id: "order", token: BootstrapTokens.OrderModule },
  { id: "payment", token: BootstrapTokens.PaymentModule },
  { id: "product", token: BootstrapTokens.ProductModule },
  { id: "notification", token: BootstrapTokens.NotificationModule },
  { id: "order-fulfillment", token: BootstrapTokens.OrderFulfillmentModule },
  { id: "delivery", token: BootstrapTokens.DeliveryModule },
  { id: "returns", token: BootstrapTokens.ReturnsModule },
  { id: "warehouse", token: BootstrapTokens.WarehouseModule },
  { id: "courier", token: BootstrapTokens.CourierModule },
  { id: "customer", token: BootstrapTokens.CustomerModule },
  { id: "seller", token: BootstrapTokens.SellerModule },
  { id: "catalog", token: BootstrapTokens.CatalogModule },
  { id: "inventory", token: BootstrapTokens.InventoryModule },
  { id: "pricing", token: BootstrapTokens.PricingModule },
  { id: "marketplace", token: BootstrapTokens.MarketplaceModule },
  { id: "moderation", token: BootstrapTokens.ModerationModule },
  { id: "support", token: BootstrapTokens.SupportModule },
  { id: "analytics", token: BootstrapTokens.AnalyticsModule },
  { id: "administration", token: BootstrapTokens.AdministrationModule },
]);

/** Collects runtime, provider, and registration diagnostics. */
export class DiagnosticsService implements IDiagnosticsService {
  constructor(
    private readonly provider: ServiceProvider,
    private readonly registry: ServiceRegistry,
    private readonly configurationService: IConfigurationProvider,
  ) {}

  async collect(): Promise<DiagnosticsReport> {
    const providerRegistry = this.provider.resolve<ProviderRegistry>(
      IntegrationTokens.ProviderRegistry,
    );
    const workerRegistry = this.provider.resolve<AIWorkerRegistry>(
      BootstrapTokens.AIWorkerRegistry,
    );
    const configuration = this.configurationService.snapshot();

    return Object.freeze({
      timestamp: new Date().toISOString(),
      runtime: Object.freeze({
        nodeVersion: typeof process !== "undefined" ? process.version : "unknown",
        platform: typeof process !== "undefined" ? process.platform : "unknown",
        configurationSource: configuration.source,
        configurationLoadedAt: configuration.loadedAt,
      }),
      providers: Object.freeze(
        providerRegistry.list().map((descriptor) =>
          Object.freeze({
            id: descriptor.id,
            name: descriptor.name,
            capability: descriptor.capability,
            vendor: descriptor.vendor,
            enabled: descriptor.enabled,
          }),
        ),
      ),
      workers: Object.freeze(workerRegistry.getAvailableWorkers()),
      modules: Object.freeze(this.collectRegisteredModules()),
      memory: this.collectMemoryUsage(),
    });
  }

  private collectRegisteredModules(): RegisteredModuleSnapshot[] {
    return REGISTERED_BCM_MODULES.map(({ id, token }) =>
      Object.freeze({
        id,
        registered: this.registry.has(token),
      }),
    );
  }

  private collectMemoryUsage(): MemoryUsageSnapshot {
    if (typeof process === "undefined" || typeof process.memoryUsage !== "function") {
      return Object.freeze({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
      });
    }

    const usage = process.memoryUsage();
    return Object.freeze({
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
    });
  }
}
