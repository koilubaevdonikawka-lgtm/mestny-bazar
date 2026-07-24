import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

export interface ICapabilitySerializer {
  serialize(capability: Capability): Promise<string>;
  deserialize(serialized: string): Promise<Capability>;
}
