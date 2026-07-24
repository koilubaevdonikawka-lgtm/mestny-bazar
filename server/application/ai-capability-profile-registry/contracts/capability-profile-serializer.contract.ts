import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

export interface ICapabilityProfileSerializer {
  serialize(capabilityProfile: CapabilityProfile): Promise<string>;
  deserialize(serialized: string): Promise<CapabilityProfile>;
}
