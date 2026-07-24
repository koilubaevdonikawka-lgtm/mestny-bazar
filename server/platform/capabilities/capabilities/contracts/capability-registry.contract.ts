import type {
  CapabilityDescriptor,
  CapabilityKind,
} from "@server/platform/capabilities/capabilities/models";

/** Contract for capability metadata registration. */
export interface ICapabilityRegistry {
  register(capability: CapabilityDescriptor): CapabilityDescriptor;
  get(capabilityId: string): CapabilityDescriptor | undefined;
  list(kind?: CapabilityKind): readonly CapabilityDescriptor[];
}
