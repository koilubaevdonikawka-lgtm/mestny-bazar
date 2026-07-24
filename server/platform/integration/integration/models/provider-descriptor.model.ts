/** Supported external provider capabilities. */
export const ProviderCapability = {
  Payment: "payment",
  Notification: "notification",
  Storage: "storage",
  AI: "ai",
  Map: "map",
  Search: "search",
  Email: "email",
  SMS: "sms",
} as const;

export type ProviderCapabilityValue =
  (typeof ProviderCapability)[keyof typeof ProviderCapability];

export const PROVIDER_CAPABILITY_VALUES: readonly ProviderCapabilityValue[] =
  Object.values(ProviderCapability);

/** Describes a registered external provider. */
export interface ProviderDescriptor {
  readonly id: string;
  readonly name: string;
  readonly capability: ProviderCapabilityValue;
  readonly vendor: string;
  readonly version: string;
  readonly enabled: boolean;
}

export function createProviderDescriptor(input: {
  id: string;
  name: string;
  capability: ProviderCapabilityValue;
  vendor: string;
  version?: string;
  enabled?: boolean;
}): ProviderDescriptor {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    capability: input.capability,
    vendor: input.vendor.trim(),
    version: input.version?.trim() || "1.0.0",
    enabled: input.enabled ?? true,
  });
}
