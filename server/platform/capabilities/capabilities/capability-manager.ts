import type { ICapabilityManager } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityRegistry } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityDiscoveryEngine } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityDependencyEngine } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityAvailabilityEngine } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityCatalog } from "@server/platform/capabilities/capabilities/contracts";
import type {
  CapabilityAvailability,
  CapabilityCatalog,
  CapabilityDependency,
  CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";

/** Orchestrates capability registration, discovery and catalog generation. */
export class CapabilityManager implements ICapabilityManager {
  constructor(
    private readonly registry: ICapabilityRegistry,
    private readonly discoveryEngine: ICapabilityDiscoveryEngine,
    private readonly dependencyEngine: ICapabilityDependencyEngine,
    private readonly availabilityEngine: ICapabilityAvailabilityEngine,
    private readonly catalogService: ICapabilityCatalog,
  ) {}

  registerCapability(capability: CapabilityDescriptor): CapabilityDescriptor {
    return this.registry.register(capability);
  }

  discoverCapabilities(): readonly CapabilityDescriptor[] {
    const discovered = this.discoveryEngine.discover();
    for (const capability of discovered) {
      if (!this.registry.get(capability.id)) {
        this.registry.register(capability);
      }
    }
    return discovered;
  }

  resolveDependencies(capabilityId: string): CapabilityDependency {
    const capability = this.requireCapability(capabilityId);
    return this.dependencyEngine.resolve(capability, this.registry.list());
  }

  checkAvailability(capabilityId: string): CapabilityAvailability {
    const capability = this.requireCapability(capabilityId);
    return this.availabilityEngine.calculate(capability);
  }

  listCapabilities(kind?: CapabilityDescriptor["kind"]): readonly CapabilityDescriptor[] {
    return this.registry.list(kind);
  }

  generateCatalog(): CapabilityCatalog {
    return this.catalogService.generate();
  }

  private requireCapability(capabilityId: string): CapabilityDescriptor {
    const capability = this.registry.get(capabilityId);
    if (!capability) {
      throw new Error(`Capability not found: ${capabilityId}`);
    }
    return capability;
  }
}
