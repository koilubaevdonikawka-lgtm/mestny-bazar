import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { ProviderRegistry } from "@server/platform/integration/integration";
import {
  ArchitectureNodeKind,
  createArchitectureNode,
  createDocumentationProviderDescriptor,
  DocumentationTokens,
  registerDefaultArchitectureCatalog,
  type ArchitectureRegistry,
} from "@server/platform/documentation/documentation";

const INFRASTRUCTURE_ADAPTERS = Object.freeze([
  ["infra-cart-store", "CartStore", "infrastructure/marketplace/cart"],
  ["infra-order-store", "OrderStore", "infrastructure/marketplace/order"],
  ["infra-payment-gateway", "PaymentGateway", "infrastructure/marketplace/payment"],
  ["infra-supabase-client", "SupabaseClientProvider", "infrastructure/supabase"],
  ["infra-finik-provider", "FinikPaymentProvider", "infrastructure/finik"],
  ["infra-telegram-provider", "TelegramNotificationProvider", "infrastructure/telegram"],
  ["infra-storage-provider", "StorageProvider", "infrastructure/storage"],
] as const);

/** Activates the default architecture catalog and live provider metadata. */
export function activateDocumentationRegistry(provider: ServiceProvider): void {
  const registry = provider.resolve<ArchitectureRegistry>(
    DocumentationTokens.ArchitectureRegistry,
  );

  registerDefaultArchitectureCatalog(registry);

  for (const [id, name, path] of INFRASTRUCTURE_ADAPTERS) {
    registry.registerNode(
      createArchitectureNode({
        id,
        name,
        kind: ArchitectureNodeKind.InfrastructureAdapter,
        layer: "infrastructure",
        description: path,
      }),
    );
  }

  try {
    const providerRegistry = provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry);
    for (const descriptor of providerRegistry.list()) {
      registry.registerProvider(
        createDocumentationProviderDescriptor({
          id: descriptor.id,
          name: descriptor.name,
          capability: descriptor.capability,
          vendor: descriptor.vendor,
          adapter: descriptor.vendor,
          enabled: descriptor.enabled,
        }),
      );
    }
  } catch {
    // Provider registry may not be populated yet during partial bootstrap.
  }
}
