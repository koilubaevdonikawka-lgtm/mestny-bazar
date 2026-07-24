import type { FairnessProfile } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

export interface IFairnessProfileSerializer {
  serialize(fairnessProfile: FairnessProfile): Promise<string>;
  deserialize(serialized: string): Promise<FairnessProfile>;
}
