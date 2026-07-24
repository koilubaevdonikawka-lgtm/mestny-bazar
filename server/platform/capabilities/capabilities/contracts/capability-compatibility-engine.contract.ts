import type {
  CapabilityCompatibility,
  CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";

/** Contract for capability compatibility checks (metadata only). */
export interface ICapabilityCompatibilityEngine {
  evaluate(capability: CapabilityDescriptor): CapabilityCompatibility;
  buildMatrix(capabilities: readonly CapabilityDescriptor[]): Readonly<Record<string, boolean>>;
}
