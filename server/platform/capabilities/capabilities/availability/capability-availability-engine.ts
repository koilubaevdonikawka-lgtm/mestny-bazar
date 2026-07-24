import type { ICapabilityAvailabilityEngine } from "@server/platform/capabilities/capabilities/contracts";
import {
  createCapabilityAvailability,
  type CapabilityAvailability,
  type CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";
import { createAvailabilityCalculatedEvent } from "@server/platform/capabilities/capabilities/events";
import type { ILifecycleRegistry } from "@server/platform/lifecycle/lifecycle/contracts";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";

/** Calculates capability availability metadata. */
export class CapabilityAvailabilityEngine implements ICapabilityAvailabilityEngine {
  constructor(
    private readonly configuration: IConfigurationProvider,
    private readonly lifecycleRegistry: ILifecycleRegistry,
  ) {}

  calculate(capability: CapabilityDescriptor): CapabilityAvailability {
    const snapshot = this.configuration.snapshot();
    const lifecycleComponents = this.lifecycleRegistry.list();
    const hasLifecycle = lifecycleComponents.some(
      (component) => component.platformId.includes(capability.kind) ||
        component.id.includes(capability.id.replace("capability-", "")),
    );

    let status: CapabilityAvailability["status"] = "available";
    let reason = "capability-available";

    if (!snapshot.loadedAt) {
      status = "unavailable";
      reason = "configuration-not-loaded";
    } else if (capability.name.toLowerCase().includes("legacy")) {
      status = "deprecated";
      reason = "legacy-capability";
    } else if (capability.name.toLowerCase().includes("experimental")) {
      status = "experimental";
      reason = "experimental-capability";
    } else if (capability.name.toLowerCase().includes("internal")) {
      status = "internal";
      reason = "internal-capability";
    } else if (capability.dependencies.length > 0 && !hasLifecycle) {
      status = "unavailable";
      reason = "dependencies-not-ready";
    }

    const availability = createCapabilityAvailability({
      capabilityId: capability.id,
      status,
      reason,
    });
    createAvailabilityCalculatedEvent(availability);
    return availability;
  }

  buildReport(
    capabilities: readonly CapabilityDescriptor[],
  ): Readonly<Record<string, CapabilityAvailability["status"]>> {
    const report: Record<string, CapabilityAvailability["status"]> = {};
    for (const capability of capabilities) {
      report[capability.id] = this.calculate(capability).status;
    }
    return Object.freeze(report);
  }
}
