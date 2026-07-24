/** DI tokens for the capability platform. */
export const CapabilityTokens = {
  CapabilityPlatform: Symbol.for("capabilities.platform"),
  CapabilityManager: Symbol.for("capabilities.manager"),
  CapabilityRegistry: Symbol.for("capabilities.registry"),
  CapabilityDiscoveryEngine: Symbol.for("capabilities.discoveryEngine"),
  CapabilityDependencyEngine: Symbol.for("capabilities.dependencyEngine"),
  CapabilityCompatibilityEngine: Symbol.for("capabilities.compatibilityEngine"),
  CapabilityAvailabilityEngine: Symbol.for("capabilities.availabilityEngine"),
  CapabilityCatalog: Symbol.for("capabilities.catalog"),
} as const;

export type CapabilityToken = (typeof CapabilityTokens)[keyof typeof CapabilityTokens];
