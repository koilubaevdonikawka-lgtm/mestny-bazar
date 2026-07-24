import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { OperationsTokens } from "@server/platform/operations/operations/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import { TestingTokens } from "@server/platform/testing/testing/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { TestingPlatform } from "@server/platform/testing/testing/testing-platform";
import type { OperationsPlatform } from "@server/platform/operations/operations/operations-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IHealthService } from "@server/platform/runtime/runtime/contracts";
import {
  ChangelogGenerator,
  ReleaseManifestGenerator,
  ReleaseManager,
  ReleasePackager,
  ReleasePlatform,
  ReleasePublisher,
  ReleaseTokens,
  ReleaseValidator,
  VersionManager,
} from "@server/platform/release/release";

/** Registers release platform services in the DI container. */
export function registerReleasePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(ReleaseTokens.VersionManager, () => new VersionManager());

  registry.registerSingleton(
    ReleaseTokens.ChangelogGenerator,
    (provider) =>
      new ChangelogGenerator(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<TestingPlatform>(TestingTokens.TestingPlatform),
      ),
  );

  registry.registerSingleton(
    ReleaseTokens.ReleaseManifestGenerator,
    (provider) =>
      new ReleaseManifestGenerator(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
        registry,
      ),
  );

  registry.registerSingleton(
    ReleaseTokens.ReleaseValidator,
    (provider) =>
      new ReleaseValidator(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<TestingPlatform>(TestingTokens.TestingPlatform),
        provider.resolve<OperationsPlatform>(OperationsTokens.OperationsPlatform),
        provider.resolve<IHealthService>(RuntimeTokens.HealthService),
      ),
  );

  registry.registerSingleton(
    ReleaseTokens.ReleasePackager,
    (provider) =>
      new ReleasePackager(
        provider.resolve(ReleaseTokens.ReleaseManifestGenerator),
        provider.resolve(ReleaseTokens.ChangelogGenerator),
      ),
  );

  registry.registerSingleton(ReleaseTokens.ReleasePublisher, () => new ReleasePublisher());

  registry.registerSingleton(
    ReleaseTokens.ReleaseManager,
    (provider) =>
      new ReleaseManager(
        provider.resolve(ReleaseTokens.VersionManager),
        provider.resolve(ReleaseTokens.ReleaseManifestGenerator),
        provider.resolve(ReleaseTokens.ReleaseValidator),
        provider.resolve(ReleaseTokens.ReleasePackager),
        provider.resolve(ReleaseTokens.ReleasePublisher),
      ),
  );

  registry.registerSingleton(ReleaseTokens.ReleasePlatform, (provider) =>
    new ReleasePlatform(
      provider.resolve(ReleaseTokens.ReleaseManager),
      provider.resolve(ReleaseTokens.ChangelogGenerator),
    ),
  );
}
