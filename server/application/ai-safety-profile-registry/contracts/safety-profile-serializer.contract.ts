import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

export interface ISafetyProfileSerializer {
  serialize(safetyProfile: SafetyProfile): Promise<string>;
  deserialize(serialized: string): Promise<SafetyProfile>;
}
