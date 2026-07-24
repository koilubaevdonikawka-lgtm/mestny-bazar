import type { ProviderCapabilityValue } from "@server/platform/integration/integration/models/provider-capability.model";

/** Configuration metadata for a registered provider. */
export interface ProviderConfiguration {
  readonly providerId: string;
  readonly capability: ProviderCapabilityValue;
  readonly settings: Readonly<Record<string, unknown>>;
}

export function createProviderConfiguration(input: {
  providerId: string;
  capability: ProviderCapabilityValue;
  settings?: Readonly<Record<string, unknown>>;
}): ProviderConfiguration {
  return Object.freeze({
    providerId: input.providerId.trim(),
    capability: input.capability,
    settings: Object.freeze({ ...(input.settings ?? {}) }),
  });
}
