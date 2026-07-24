import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { OperationsTokens } from "@server/platform/operations/operations/tokens";
import { ReleaseTokens } from "@server/platform/release/release/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { OperationsPlatform } from "@server/platform/operations/operations/operations-platform";
import type { ReleasePlatform } from "@server/platform/release/release/release-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IHealthService } from "@server/platform/runtime/runtime/contracts";
import {
  BackwardCompatibilityStrategy,
  BlueGreenPreparationStrategy,
  CanaryPreparationStrategy,
  CompatibilityEngine,
  EvolutionManager,
  EvolutionPlatform,
  EvolutionTokens,
  ForwardCompatibilityStrategy,
  MigrationPlanner,
  MigrationRegistry,
  RollingMigrationStrategy,
} from "@server/platform/evolution/evolution";

/** Registers evolution platform services in the DI container. */
export function registerEvolutionPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(EvolutionTokens.MigrationRegistry, () => new MigrationRegistry());

  registry.registerSingleton(
    EvolutionTokens.CompatibilityEngine,
    (provider) =>
      new CompatibilityEngine(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
        registry,
      ),
  );

  registry.registerSingleton(
    EvolutionTokens.MigrationPlanner,
    (provider) =>
      new MigrationPlanner(
        provider.resolve(EvolutionTokens.MigrationRegistry),
        provider.resolve(EvolutionTokens.CompatibilityEngine),
      ),
  );

  registry.registerSingleton(
    EvolutionTokens.ForwardCompatibilityStrategy,
    () => new ForwardCompatibilityStrategy(),
  );
  registry.registerSingleton(
    EvolutionTokens.BackwardCompatibilityStrategy,
    () => new BackwardCompatibilityStrategy(),
  );
  registry.registerSingleton(
    EvolutionTokens.RollingMigrationStrategy,
    () => new RollingMigrationStrategy(),
  );
  registry.registerSingleton(
    EvolutionTokens.BlueGreenPreparationStrategy,
    () => new BlueGreenPreparationStrategy(),
  );
  registry.registerSingleton(
    EvolutionTokens.CanaryPreparationStrategy,
    () => new CanaryPreparationStrategy(),
  );

  registry.registerSingleton(
    EvolutionTokens.EvolutionManager,
    (provider) =>
      new EvolutionManager(
        provider.resolve(EvolutionTokens.MigrationPlanner),
        provider.resolve(EvolutionTokens.CompatibilityEngine),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<ReleasePlatform>(ReleaseTokens.ReleasePlatform),
        provider.resolve<OperationsPlatform>(OperationsTokens.OperationsPlatform),
        provider.resolve<IHealthService>(RuntimeTokens.HealthService),
        [
          provider.resolve(EvolutionTokens.ForwardCompatibilityStrategy),
          provider.resolve(EvolutionTokens.BackwardCompatibilityStrategy),
          provider.resolve(EvolutionTokens.RollingMigrationStrategy),
          provider.resolve(EvolutionTokens.BlueGreenPreparationStrategy),
          provider.resolve(EvolutionTokens.CanaryPreparationStrategy),
        ],
      ),
  );

  registry.registerSingleton(EvolutionTokens.EvolutionPlatform, (provider) =>
    new EvolutionPlatform(
      provider.resolve(EvolutionTokens.EvolutionManager),
      provider.resolve(EvolutionTokens.MigrationRegistry),
      provider.resolve(EvolutionTokens.CompatibilityEngine),
    ),
  );
}
