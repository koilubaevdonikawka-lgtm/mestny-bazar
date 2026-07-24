import type { ICapabilityCatalog } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityRegistry } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityDependencyEngine } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityCompatibilityEngine } from "@server/platform/capabilities/capabilities/contracts";
import type { ICapabilityAvailabilityEngine } from "@server/platform/capabilities/capabilities/contracts";
import {
  createCapabilityCatalog,
  createCapabilityCatalogEntry,
  type CapabilityCatalog,
} from "@server/platform/capabilities/capabilities/models";
import { createCatalogGeneratedEvent } from "@server/platform/capabilities/capabilities/events";

/** Generates unified capability catalog metadata. */
export class CapabilityCatalogService implements ICapabilityCatalog {
  constructor(
    private readonly registry: ICapabilityRegistry,
    private readonly dependencyEngine: ICapabilityDependencyEngine,
    private readonly compatibilityEngine: ICapabilityCompatibilityEngine,
    private readonly availabilityEngine: ICapabilityAvailabilityEngine,
  ) {}

  generate(): CapabilityCatalog {
    const capabilities = this.registry.list();
    const entries = capabilities.map((capability) =>
      createCapabilityCatalogEntry({
        capability,
        dependency: this.dependencyEngine.resolve(capability, capabilities),
        compatibility: this.compatibilityEngine.evaluate(capability),
        availability: this.availabilityEngine.calculate(capability),
      }),
    );

    const catalog = createCapabilityCatalog({
      entries,
      dependencyMap: this.dependencyEngine.buildGraph(capabilities),
      compatibilityMatrix: this.compatibilityEngine.buildMatrix(capabilities),
      availabilityReport: this.availabilityEngine.buildReport(capabilities),
    });
    createCatalogGeneratedEvent(catalog);
    return catalog;
  }
}
