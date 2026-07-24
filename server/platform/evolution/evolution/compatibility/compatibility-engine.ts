import type { ICompatibilityEngine } from "@server/platform/evolution/evolution/contracts";
import {
  createCompatibilityReport,
  type CompatibilityReport,
} from "@server/platform/evolution/evolution/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { BootstrapTokens } from "@server/bootstrap/tokens";

/** Assesses platform, provider, contract and module API compatibility. */
export class CompatibilityEngine implements ICompatibilityEngine {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly providerRegistry: ProviderRegistry,
    private readonly serviceRegistry: ServiceRegistry,
  ) {}

  assess(targetVersion: string): CompatibilityReport {
    const bundle = this.documentation.generateDocumentation();
    const liveProviders = this.providerRegistry.list();
    const documentedProviderIds = new Set(
      bundle.providerCatalog.providers.map((provider) => provider.id),
    );

    const moduleEntries = bundle.moduleCatalog.entries;
    const registeredModules = moduleEntries.filter((entry) => entry.registered).length;

    const moduleTokens = Object.entries(BootstrapTokens)
      .filter(([key]) => key.endsWith("Module"))
      .map(([, token]) => token as symbol);

    const diRegisteredModules = moduleTokens.filter((token) =>
      this.serviceRegistry.has(token),
    ).length;

    const findings = [
      {
        area: "platform-compatibility",
        compatible: bundle.summary.platformCount > 0,
        message: `${bundle.summary.platformCount} platform modules documented for target ${targetVersion}.`,
      },
      {
        area: "provider-compatibility",
        compatible: liveProviders.every((provider) => documentedProviderIds.has(provider.id)),
        message: `${liveProviders.length} live providers, ${documentedProviderIds.size} documented.`,
      },
      {
        area: "contract-compatibility",
        compatible: bundle.summary.contractCount > 0,
        message: `${bundle.summary.contractCount} contracts registered.`,
      },
      {
        area: "module-api-compatibility",
        compatible: registeredModules === diRegisteredModules,
        message: `${registeredModules}/${moduleEntries.length} modules registered in DI.`,
      },
    ];

    return createCompatibilityReport({ findings });
  }
}
