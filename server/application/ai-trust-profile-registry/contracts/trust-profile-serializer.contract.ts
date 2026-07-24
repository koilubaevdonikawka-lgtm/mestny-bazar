import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

export interface ITrustProfileSerializer {
  serialize(trustProfile: TrustProfile): Promise<string>;
  deserialize(serialized: string): Promise<TrustProfile>;
}
