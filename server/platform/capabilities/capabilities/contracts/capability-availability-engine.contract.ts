import type {
  CapabilityAvailability,
  CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";

/** Contract for capability availability calculation (metadata only). */
export interface ICapabilityAvailabilityEngine {
  calculate(capability: CapabilityDescriptor): CapabilityAvailability;
  buildReport(
    capabilities: readonly CapabilityDescriptor[],
  ): Readonly<Record<string, CapabilityAvailability["status"]>>;
}
