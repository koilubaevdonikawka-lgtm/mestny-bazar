import type { ICapabilitySerializer } from "@server/application/ai-capability-registry/contracts/capability-serializer.contract";
import {
  createCapability,
  type Capability,
} from "@server/application/ai-capability-registry/models/capability.model";

/** JSON-based capability serializer. */
export class JsonCapabilitySerializer implements ICapabilitySerializer {
  async serialize(capability: Capability): Promise<string> {
    return JSON.stringify(capability);
  }

  async deserialize(serialized: string): Promise<Capability> {
    if (!serialized.trim()) {
      throw new Error("Serialized capability cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Capability>;
    return createCapability({
      capabilityId: parsed.capabilityId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
