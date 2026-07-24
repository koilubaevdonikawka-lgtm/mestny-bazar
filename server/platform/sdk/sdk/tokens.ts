/** DI tokens for the SDK platform. */
export const SDKTokens = {
  SDKPlatform: Symbol.for("sdk.platform"),
  SDKManager: Symbol.for("sdk.manager"),
  SDKRegistry: Symbol.for("sdk.registry"),
  SerializationEngine: Symbol.for("sdk.serializationEngine"),
  SDKCompatibilityEngine: Symbol.for("sdk.compatibilityEngine"),
  SDKGenerator: Symbol.for("sdk.generator"),
} as const;

export type SDKToken = (typeof SDKTokens)[keyof typeof SDKTokens];
