import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  EvolutionTokens,
  registerDefaultMigrations,
  type MigrationRegistry,
} from "@server/platform/evolution/evolution";

/** Activates evolution platform metadata and default migrations. */
export function activateEvolutionPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-evolution",
      name: "Evolution Platform",
      path: "server/platform/evolution",
      components: [
        "EvolutionPlatform",
        "EvolutionManager",
        "MigrationRegistry",
        "MigrationPlanner",
        "CompatibilityEngine",
      ],
      dependencies: [
        "platform-documentation",
        "platform-governance",
        "platform-release",
        "platform-operations",
        "platform-runtime",
        "platform-integration",
      ],
    }),
  });

  const registry = provider.resolve<MigrationRegistry>(EvolutionTokens.MigrationRegistry);
  registerDefaultMigrations(registry);
}
