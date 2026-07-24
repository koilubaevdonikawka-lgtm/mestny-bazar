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
import type { IHealthService } from "@server/platform/runtime/runtime/contracts";
import {
  AdapterGenerator,
  ArchitectureAnalyzer,
  ContractGenerator,
  DependencyInspector,
  DeveloperCommandRunner,
  DeveloperPlatform,
  DeveloperTokens,
  EventGenerator,
  ModuleGenerator,
  ModuleInspector,
  PlatformGenerator,
  PlatformInspector,
  ProviderInspector,
  ScaffoldingEngine,
} from "@server/platform/developer/developer";

/** Registers developer platform services in the DI container. */
export function registerDeveloperPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(
    DeveloperTokens.ArchitectureAnalyzer,
    (provider) =>
      new ArchitectureAnalyzer(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        registry,
      ),
  );

  registry.registerSingleton(
    DeveloperTokens.DependencyInspector,
    (provider) =>
      new DependencyInspector(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
      ),
  );
  registry.registerSingleton(
    DeveloperTokens.ModuleInspector,
    (provider) =>
      new ModuleInspector(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
      ),
  );
  registry.registerSingleton(
    DeveloperTokens.ProviderInspector,
    (provider) =>
      new ProviderInspector(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );
  registry.registerSingleton(
    DeveloperTokens.PlatformInspector,
    (provider) =>
      new PlatformInspector(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        registry,
      ),
  );

  registry.registerSingleton(DeveloperTokens.ModuleGenerator, () => new ModuleGenerator());
  registry.registerSingleton(DeveloperTokens.PlatformGenerator, () => new PlatformGenerator());
  registry.registerSingleton(DeveloperTokens.AdapterGenerator, () => new AdapterGenerator());
  registry.registerSingleton(DeveloperTokens.ContractGenerator, () => new ContractGenerator());
  registry.registerSingleton(DeveloperTokens.EventGenerator, () => new EventGenerator());
  registry.registerSingleton(DeveloperTokens.ScaffoldingEngine, () => new ScaffoldingEngine());

  registry.registerSingleton(DeveloperTokens.DeveloperCommandRunner, (provider) =>
    new DeveloperCommandRunner(
      provider.resolve(DeveloperTokens.ArchitectureAnalyzer),
      [
        provider.resolve(DeveloperTokens.DependencyInspector),
        provider.resolve(DeveloperTokens.ModuleInspector),
        provider.resolve(DeveloperTokens.ProviderInspector),
        provider.resolve(DeveloperTokens.PlatformInspector),
      ],
      [
        provider.resolve(DeveloperTokens.ModuleGenerator),
        provider.resolve(DeveloperTokens.PlatformGenerator),
        provider.resolve(DeveloperTokens.AdapterGenerator),
        provider.resolve(DeveloperTokens.ContractGenerator),
        provider.resolve(DeveloperTokens.EventGenerator),
      ],
      provider.resolve(DeveloperTokens.ScaffoldingEngine),
      provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
      provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
      provider.resolve<TestingPlatform>(TestingTokens.TestingPlatform),
      provider.resolve<IHealthService>(RuntimeTokens.HealthService),
    ),
  );

  registry.registerSingleton(DeveloperTokens.DeveloperPlatform, (provider) =>
    new DeveloperPlatform(
      provider.resolve(DeveloperTokens.DeveloperCommandRunner),
      provider.resolve(DeveloperTokens.ArchitectureAnalyzer),
      [
        provider.resolve(DeveloperTokens.DependencyInspector),
        provider.resolve(DeveloperTokens.ModuleInspector),
        provider.resolve(DeveloperTokens.ProviderInspector),
        provider.resolve(DeveloperTokens.PlatformInspector),
      ],
      [
        provider.resolve(DeveloperTokens.ModuleGenerator),
        provider.resolve(DeveloperTokens.PlatformGenerator),
        provider.resolve(DeveloperTokens.AdapterGenerator),
        provider.resolve(DeveloperTokens.ContractGenerator),
        provider.resolve(DeveloperTokens.EventGenerator),
      ],
      provider.resolve(DeveloperTokens.ScaffoldingEngine),
      provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
      provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
    ),
  );
}
