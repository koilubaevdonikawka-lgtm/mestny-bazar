import type { ICapabilityManager } from "@server/platform/capabilities/capabilities/contracts";
import type {
  CapabilityAvailability,
  CapabilityCatalog,
  CapabilityDependency,
  CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";

/** Public capability platform facade. */
export class CapabilityPlatform {
  constructor(private readonly manager: ICapabilityManager) {}

  registerCapability(capability: CapabilityDescriptor): CapabilityDescriptor {
    return this.manager.registerCapability(capability);
  }

  discoverCapabilities(): readonly CapabilityDescriptor[] {
    return this.manager.discoverCapabilities();
  }

  resolveDependencies(capabilityId: string): CapabilityDependency {
    return this.manager.resolveDependencies(capabilityId);
  }

  checkAvailability(capabilityId: string): CapabilityAvailability {
    return this.manager.checkAvailability(capabilityId);
  }

  listCapabilities(kind?: CapabilityDescriptor["kind"]): readonly CapabilityDescriptor[] {
    return this.manager.listCapabilities(kind);
  }

  generateCatalog(): CapabilityCatalog {
    return this.manager.generateCatalog();
  }
}
