import type { IScopeResolver } from "@server/platform/policy/policy/contracts";
import {
  createPolicyScopeContext,
  type PolicyScope,
  type PolicyScopeContext,
} from "@server/platform/policy/policy/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";

const ALL_SCOPES: readonly PolicyScope[] = Object.freeze([
  "platform",
  "provider",
  "sdk",
  "gateway",
  "runtime",
  "documentation",
]);

/** Resolves policy scopes from platform metadata. */
export class ScopeResolver implements IScopeResolver {
  constructor(
    private readonly configuration: IConfigurationProvider,
    private readonly documentation: DocumentationPlatform,
    private readonly gateway: GatewayPlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  resolve(scope: PolicyScope): PolicyScopeContext {
    switch (scope) {
      case "platform": {
        const bundle = this.documentation.generateDocumentation();
        return createPolicyScopeContext({
          scope,
          identifiers: [`platform-count:${bundle.summary.platformCount}`],
        });
      }
      case "provider":
        return createPolicyScopeContext({
          scope,
          identifiers: this.providerRegistry.list().map((provider) => provider.id),
        });
      case "sdk": {
        const bundle = this.documentation.generateDocumentation();
        const sdkModules = bundle.moduleCatalog.entries
          .filter((entry) => entry.module.name.toLowerCase().includes("sdk"))
          .map((entry) => entry.module.id);
        return createPolicyScopeContext({ scope, identifiers: sdkModules });
      }
      case "gateway":
        return createPolicyScopeContext({
          scope,
          identifiers: this.gateway.supportedVersions().map(
            (version) => `v${version.major}.${version.minor}`,
          ),
        });
      case "runtime": {
        const snapshot = this.configuration.snapshot();
        return createPolicyScopeContext({
          scope,
          identifiers: [String(snapshot.source)],
        });
      }
      case "documentation": {
        const bundle = this.documentation.generateDocumentation();
        return createPolicyScopeContext({
          scope,
          identifiers: [`modules:${bundle.summary.moduleCount}`, `contracts:${bundle.summary.contractCount}`],
        });
      }
      default:
        return createPolicyScopeContext({ scope, identifiers: [] });
    }
  }

  resolveAll(): readonly PolicyScopeContext[] {
    return Object.freeze(ALL_SCOPES.map((scope) => this.resolve(scope)));
  }
}
