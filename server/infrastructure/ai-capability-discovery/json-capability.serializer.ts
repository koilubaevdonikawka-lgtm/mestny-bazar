import type { ICapabilitySerializer } from "@server/application/ai-capability-discovery/contracts/capability-serializer.contract";
import {
  createAiCapability,
  type AiCapability,
} from "@server/application/ai-capability-discovery/models/capability.model";

/** JSON-based capability description serializer. */
export class JsonCapabilitySerializer implements ICapabilitySerializer {
  serialize(capability: AiCapability): string {
    return JSON.stringify({
      capabilityId: capability.capabilityId,
      name: capability.name,
      description: capability.description,
      category: capability.category,
      definition: capability.definition,
      status: capability.status,
    });
  }

  deserialize(payload: string): AiCapability {
    const parsed = JSON.parse(payload) as {
      capabilityId: string;
      name: string;
      description?: string;
      category?: string;
      definition?: unknown;
      status?: "active" | "inactive";
      createdAt?: string;
      updatedAt?: string;
    };

    return createAiCapability(parsed);
  }
}
