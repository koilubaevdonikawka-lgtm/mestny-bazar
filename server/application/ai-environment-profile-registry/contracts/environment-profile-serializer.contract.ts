import type { EnvironmentProfile } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

export interface IEnvironmentProfileSerializer {
  serialize(environmentProfile: EnvironmentProfile): Promise<string>;
  deserialize(serialized: string): Promise<EnvironmentProfile>;
}
