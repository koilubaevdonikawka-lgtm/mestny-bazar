import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import { TestingTokens } from "@server/platform/testing/testing/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { TestingPlatform } from "@server/platform/testing/testing/testing-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type {
  IConfigurationProvider,
  IDiagnosticsService,
  IHealthService,
} from "@server/platform/runtime/runtime/contracts";
import {
  BackupService,
  CleanupService,
  MaintenanceEngine,
  MaintenanceScheduler,
  OperationsPlatform,
  OperationsTokens,
  RestoreService,
  RetentionService,
} from "@server/platform/operations/operations";

/** Registers operations platform services in the DI container. */
export function registerOperationsPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(
    OperationsTokens.CleanupService,
    (provider) =>
      new CleanupService(
        provider.resolve<IDiagnosticsService>(RuntimeTokens.DiagnosticsService),
        provider.resolve<TestingPlatform>(TestingTokens.TestingPlatform),
      ),
  );

  registry.registerSingleton(
    OperationsTokens.BackupService,
    (provider) =>
      new BackupService(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<IHealthService>(RuntimeTokens.HealthService),
        provider.resolve<IDiagnosticsService>(RuntimeTokens.DiagnosticsService),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    OperationsTokens.RestoreService,
    (provider) =>
      new RestoreService(provider.resolve(OperationsTokens.BackupService)),
  );

  registry.registerSingleton(
    OperationsTokens.RetentionService,
    (provider) =>
      new RetentionService(provider.resolve(OperationsTokens.BackupService)),
  );

  registry.registerSingleton(OperationsTokens.MaintenanceScheduler, () => new MaintenanceScheduler());

  registry.registerSingleton(
    OperationsTokens.MaintenanceEngine,
    (provider) =>
      new MaintenanceEngine(
        provider.resolve(OperationsTokens.CleanupService),
        provider.resolve(OperationsTokens.BackupService),
        provider.resolve(OperationsTokens.RestoreService),
        provider.resolve(OperationsTokens.RetentionService),
      ),
  );

  registry.registerSingleton(OperationsTokens.OperationsPlatform, (provider) =>
    new OperationsPlatform(
      provider.resolve(OperationsTokens.MaintenanceEngine),
      provider.resolve(OperationsTokens.BackupService),
      provider.resolve(OperationsTokens.RestoreService),
      provider.resolve(OperationsTokens.RetentionService),
      provider.resolve(OperationsTokens.MaintenanceScheduler),
    ),
  );
}
