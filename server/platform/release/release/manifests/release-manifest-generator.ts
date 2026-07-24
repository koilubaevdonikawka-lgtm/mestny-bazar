import type { IManifestGenerator } from "@server/platform/release/release/contracts";
import { createReleaseManifest, type ReleaseManifest } from "@server/platform/release/release/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { BootstrapTokens } from "@server/bootstrap/tokens";

/** Generates release manifests from platform metadata. */
export class ReleaseManifestGenerator implements IManifestGenerator {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly providerRegistry: ProviderRegistry,
    private readonly serviceRegistry: ServiceRegistry,
  ) {}

  generate(version: string): ReleaseManifest {
    const bundle = this.documentation.generateDocumentation();

    const platformManifest = Object.freeze({
      version,
      platforms: bundle.platformCatalog.platforms.map((platform) => ({
        id: platform.id,
        name: platform.name,
        path: platform.path,
        components: platform.components,
      })),
      platformCount: bundle.summary.platformCount,
    });

    const moduleManifest = Object.freeze({
      version,
      modules: bundle.moduleCatalog.entries.map((entry) => ({
        id: entry.module.id,
        name: entry.module.name,
        kind: entry.module.kind,
        registered: entry.registered,
        publicMethods: entry.module.publicMethods,
      })),
      moduleCount: bundle.summary.moduleCount,
    });

    const providerManifest = Object.freeze({
      version,
      documentedProviders: bundle.providerCatalog.providers,
      liveProviders: this.providerRegistry.list(),
      providerCount: bundle.summary.providerCount,
    });

    const registeredModules = Object.values(BootstrapTokens)
      .filter((token) => String(token).includes("Module"))
      .filter((token) => this.serviceRegistry.has(token as symbol));

    const dependencyManifest = Object.freeze({
      version,
      edges: bundle.dependencyGraph.edges,
      nodes: bundle.dependencyGraph.nodes.length,
      registeredModuleTokens: registeredModules.length,
      dependencyCount: bundle.summary.dependencyCount,
    });

    return createReleaseManifest({
      version,
      platformManifest,
      moduleManifest,
      providerManifest,
      dependencyManifest,
    });
  }
}
