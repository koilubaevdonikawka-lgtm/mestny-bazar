import type { ISDKCompatibilityEngine } from "@server/platform/sdk/sdk/contracts";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import {
  createSDKCompatibilityResult,
  type SDKCompatibilityResult,
} from "@server/platform/sdk/sdk/models";
import { createSDKCompatibilityCheckedEvent, createSDKValidatedEvent } from "@server/platform/sdk/sdk/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { EvolutionPlatform } from "@server/platform/evolution/evolution/evolution-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { BootstrapTokens } from "@server/bootstrap/tokens";

/** Checks SDK, module API, contract and provider compatibility. */
export class SDKCompatibilityEngine implements ISDKCompatibilityEngine {
  constructor(
    private readonly registry: ISDKRegistry,
    private readonly documentation: DocumentationPlatform,
    private readonly evolution: EvolutionPlatform,
    private readonly providerRegistry: ProviderRegistry,
    private readonly serviceRegistry: ServiceRegistry,
  ) {}

  check(clientId: string, clientVersion: string): SDKCompatibilityResult {
    const client = this.registry.getClient(clientId);
    const bundle = this.documentation.generateDocumentation();
    const architectureValidation = this.documentation.validateArchitecture();
    const liveProviders = this.providerRegistry.list();
    const evolutionReport = this.evolution.compatibilityReport(clientVersion);

    const registeredVersions = this.registry.listVersions();
    const versionCompatible = registeredVersions.some((v) => v.label === clientVersion);

    const moduleTokens = Object.entries(BootstrapTokens)
      .filter(([key]) => key.endsWith("Module"))
      .map(([, token]) => token as symbol);
    const diModules = moduleTokens.filter((token) => this.serviceRegistry.has(token)).length;

    const findings = [
      {
        area: "sdk-version",
        compatible: versionCompatible || client?.version === clientVersion,
        message: client
          ? `Client ${clientId} version ${client.version}, requested ${clientVersion}.`
          : `Client ${clientId} not found.`,
      },
      {
        area: "module-api",
        compatible: diModules === bundle.moduleCatalog.entries.filter((e) => e.registered).length,
        message: `${diModules} module API tokens registered in DI.`,
      },
      {
        area: "contract",
        compatible: bundle.summary.contractCount > 0,
        message: `${bundle.summary.contractCount} contracts available.`,
      },
      {
        area: "provider",
        compatible: liveProviders.length > 0,
        message: `${liveProviders.length} providers registered.`,
      },
      {
        area: "governance",
        compatible: architectureValidation.valid,
        message: architectureValidation.valid
          ? "Architecture validation passed for SDK consumers."
          : `${architectureValidation.violations.length} governance/architecture violations.`,
      },
      {
        area: "evolution",
        compatible: evolutionReport.compatible,
        message: evolutionReport.compatible
          ? "Evolution compatibility passed."
          : "Evolution compatibility issues detected.",
      },
    ];

    const result = createSDKCompatibilityResult({ clientId, findings });
    createSDKCompatibilityCheckedEvent(result);
    createSDKValidatedEvent(result);
    return result;
  }
}
