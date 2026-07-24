import type { ITargetingEngine } from "@server/platform/features/features/contracts";
import { createTargetingContext, type TargetingContext } from "@server/platform/features/features/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";

/** Resolves targeting context from platform metadata. */
export class TargetingEngine implements ITargetingEngine {
  constructor(
    private readonly configuration: IConfigurationProvider,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly gateway: GatewayPlatform,
    private readonly sdkRegistry: ISDKRegistry,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  buildContext(overrides: Partial<TargetingContext> = {}): TargetingContext {
    const snapshot = this.configuration.snapshot();
    const environment =
      overrides.environment ??
      String(snapshot.values.NODE_ENV ?? snapshot.values.environment ?? "development");
    const platform = overrides.platform ?? "platform-features";

    void this.documentation.generateDocumentation().summary.platformCount;
    void this.governance;

    const providers =
      overrides.providers ??
      this.providerRegistry.list().map((provider) => provider.id);
    const sdkClients =
      overrides.sdkClients ??
      this.sdkRegistry.listClients().map((client) => client.id);
    const apiVersions =
      overrides.apiVersions ??
      this.gateway.supportedVersions().map((version) => `${version.major}.${version.minor}`);

    return createTargetingContext({
      environment,
      platform,
      providers,
      sdkClients,
      apiVersions,
    });
  }

  matchesEnvironment(context: TargetingContext, environment: string): boolean {
    return context.environment.toLowerCase() === environment.trim().toLowerCase();
  }

  matchesPlatform(context: TargetingContext, platform: string): boolean {
    return context.platform.toLowerCase() === platform.trim().toLowerCase();
  }

  matchesProvider(context: TargetingContext, providerId: string): boolean {
    return context.providers.includes(providerId.trim());
  }

  matchesSdkClient(context: TargetingContext, clientId: string): boolean {
    return context.sdkClients.includes(clientId.trim());
  }

  matchesApiVersion(context: TargetingContext, version: string): boolean {
    return context.apiVersions.includes(version.trim());
  }
}
