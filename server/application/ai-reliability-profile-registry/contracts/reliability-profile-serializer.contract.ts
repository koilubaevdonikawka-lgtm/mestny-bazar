import type { ReliabilityProfile } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

export interface IReliabilityProfileSerializer {
  serialize(reliabilityProfile: ReliabilityProfile): Promise<string>;
  deserialize(serialized: string): Promise<ReliabilityProfile>;
}
