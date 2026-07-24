import type { ISDKGenerator } from "@server/platform/sdk/sdk/contracts";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import { createSDKManifest, type SDKManifest } from "@server/platform/sdk/sdk/models";
import { CLIENT_TYPE_CATALOG } from "@server/platform/sdk/sdk/clients";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { ReleasePlatform } from "@server/platform/release/release/release-platform";

/** Generates SDK manifest metadata without creating client files. */
export class SDKGenerator implements ISDKGenerator {
  constructor(
    private readonly registry: ISDKRegistry,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly release: ReleasePlatform,
  ) {}

  generate(clientId: string, version: string): SDKManifest {
    const client = this.registry.getClient(clientId);
    if (!client) {
      throw new Error(`SDK client not found: ${clientId}`);
    }

    const bundle = this.documentation.generateDocumentation();
    const clientType = CLIENT_TYPE_CATALOG.find((entry) => entry.kind === client.kind);

    const clientManifest = Object.freeze({
      id: client.id,
      name: client.name,
      kind: client.kind,
      version: client.version,
      transport: clientType?.transport ?? "unknown",
      supportedPlatforms: client.supportedPlatforms,
    });

    const sdkManifest = Object.freeze({
      version,
      platforms: this.registry.listSupportedPlatforms(),
      registeredClients: this.registry.listClients().length,
      registeredVersions: this.registry.listVersions().map((entry) => entry.label),
      governanceIntegrated: Boolean(this.governance),
      releaseIntegrated: Boolean(this.release),
      changelogAvailable: typeof this.release.generateChangelog === "function",
    });

    const contractManifest = Object.freeze({
      contracts: bundle.contracts,
      publicApis: bundle.publicApiCatalog.entries.map((entry) => ({
        moduleId: entry.moduleId,
        methods: entry.methods,
      })),
    });

    const endpointManifest = Object.freeze({
      modules: bundle.moduleCatalog.entries.map((entry) => ({
        id: entry.module.id,
        name: entry.module.name,
        moduleApiToken: entry.module.moduleApiToken,
        publicMethods: entry.module.publicMethods,
      })),
      providers: bundle.providerCatalog.providers.map((provider) => ({
        id: provider.id,
        capability: provider.capability,
      })),
    });

    return createSDKManifest({
      version,
      clientManifest,
      sdkManifest,
      contractManifest,
      endpointManifest,
    });
  }
}
