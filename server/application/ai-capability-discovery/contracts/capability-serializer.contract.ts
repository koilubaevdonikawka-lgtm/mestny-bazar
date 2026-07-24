import type { AiCapability } from "@server/application/ai-capability-discovery/models/capability.model";

export interface ICapabilitySerializer {
  serialize(capability: AiCapability): string;
  deserialize(payload: string): AiCapability;
}
