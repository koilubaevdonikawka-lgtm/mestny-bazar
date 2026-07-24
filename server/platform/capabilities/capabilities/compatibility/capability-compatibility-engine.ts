import type { ICapabilityCompatibilityEngine } from "@server/platform/capabilities/capabilities/contracts";
import {
  createCapabilityCompatibility,
  type CapabilityCompatibility,
  type CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { ISDKRegistry } from "@server/platform/sdk/sdk/contracts";
import type { ProviderRegistry } from "@server/platform/integration/integration";

/** Evaluates capability compatibility metadata. */
export class CapabilityCompatibilityEngine implements ICapabilityCompatibilityEngine {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly gateway: GatewayPlatform,
    private readonly sdkRegistry: ISDKRegistry,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  evaluate(capability: CapabilityDescriptor): CapabilityCompatibility {
    const bundle = this.documentation.generateDocumentation();
    const platformCompatible = bundle.summary.platformCount > 0;
    const providerCompatible =
      capability.kind !== "provider" || this.providerRegistry.list().length > 0;
    const sdkCompatible =
      capability.kind !== "sdk" || this.sdkRegistry.listClients().length >= 0;
    const gatewayCompatible =
      capability.kind !== "gateway" || this.gateway.supportedVersions().length > 0;
    const versionCompatible = /^\d+\.\d+(\.\d+)?$/.test(capability.version);
    const compatible =
      platformCompatible &&
      providerCompatible &&
      sdkCompatible &&
      gatewayCompatible &&
      versionCompatible;

    return createCapabilityCompatibility({
      capabilityId: capability.id,
      compatible,
      platformCompatible,
      providerCompatible,
      sdkCompatible,
      gatewayCompatible,
      versionCompatible,
    });
  }

  buildMatrix(
    capabilities: readonly CapabilityDescriptor[],
  ): Readonly<Record<string, boolean>> {
    const matrix: Record<string, boolean> = {};
    for (const capability of capabilities) {
      matrix[capability.id] = this.evaluate(capability).compatible;
    }
    return Object.freeze(matrix);
  }
}
