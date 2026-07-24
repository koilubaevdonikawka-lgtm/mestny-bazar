import type {
  CapabilityAvailability,
  CapabilityCatalog,
  CapabilityDependency,
  CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";

/** Contract for capability lifecycle orchestration. */
export interface ICapabilityManager {
  registerCapability(capability: CapabilityDescriptor): CapabilityDescriptor;
  discoverCapabilities(): readonly CapabilityDescriptor[];
  resolveDependencies(capabilityId: string): CapabilityDependency;
  checkAvailability(capabilityId: string): CapabilityAvailability;
  listCapabilities(kind?: CapabilityDescriptor["kind"]): readonly CapabilityDescriptor[];
  generateCatalog(): CapabilityCatalog;
}
