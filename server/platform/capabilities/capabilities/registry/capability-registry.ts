import type { ICapabilityRegistry } from "@server/platform/capabilities/capabilities/contracts";
import {
  createCapabilityDescriptor,
  type CapabilityDescriptor,
  type CapabilityKind,
} from "@server/platform/capabilities/capabilities/models";
import { createCapabilityRegisteredEvent } from "@server/platform/capabilities/capabilities/events";

/** Central registry for platform capability metadata. */
export class CapabilityRegistry implements ICapabilityRegistry {
  private readonly capabilities = new Map<string, CapabilityDescriptor>();

  register(capability: CapabilityDescriptor): CapabilityDescriptor {
    const stored = createCapabilityDescriptor(capability);
    this.capabilities.set(stored.id, stored);
    createCapabilityRegisteredEvent(stored);
    return stored;
  }

  get(capabilityId: string): CapabilityDescriptor | undefined {
    return this.capabilities.get(capabilityId.trim());
  }

  list(kind?: CapabilityKind): readonly CapabilityDescriptor[] {
    const values = [...this.capabilities.values()];
    const filtered = kind ? values.filter((capability) => capability.kind === kind) : values;
    return Object.freeze([...filtered]);
  }
}
