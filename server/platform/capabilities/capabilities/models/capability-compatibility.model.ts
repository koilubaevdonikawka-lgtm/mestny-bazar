/** Capability compatibility check result metadata. */
export interface CapabilityCompatibility {
  readonly capabilityId: string;
  readonly compatible: boolean;
  readonly platformCompatible: boolean;
  readonly providerCompatible: boolean;
  readonly sdkCompatible: boolean;
  readonly gatewayCompatible: boolean;
  readonly versionCompatible: boolean;
  readonly evaluatedAt: string;
}

export function createCapabilityCompatibility(input: {
  capabilityId: string;
  compatible: boolean;
  platformCompatible?: boolean;
  providerCompatible?: boolean;
  sdkCompatible?: boolean;
  gatewayCompatible?: boolean;
  versionCompatible?: boolean;
}): CapabilityCompatibility {
  return Object.freeze({
    capabilityId: input.capabilityId.trim(),
    compatible: input.compatible,
    platformCompatible: input.platformCompatible ?? input.compatible,
    providerCompatible: input.providerCompatible ?? input.compatible,
    sdkCompatible: input.sdkCompatible ?? input.compatible,
    gatewayCompatible: input.gatewayCompatible ?? input.compatible,
    versionCompatible: input.versionCompatible ?? input.compatible,
    evaluatedAt: new Date().toISOString(),
  });
}
