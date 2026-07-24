export type CapabilityAvailabilityStatus =
  | "available"
  | "unavailable"
  | "deprecated"
  | "experimental"
  | "internal";

/** Capability availability metadata. */
export interface CapabilityAvailability {
  readonly capabilityId: string;
  readonly status: CapabilityAvailabilityStatus;
  readonly reason: string;
  readonly calculatedAt: string;
}

export function createCapabilityAvailability(input: {
  capabilityId: string;
  status: CapabilityAvailabilityStatus;
  reason: string;
}): CapabilityAvailability {
  return Object.freeze({
    capabilityId: input.capabilityId.trim(),
    status: input.status,
    reason: input.reason.trim(),
    calculatedAt: new Date().toISOString(),
  });
}
