import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

export interface ITrustProfileCatalog {
  register(trustProfile: TrustProfile): Promise<void>;
  remove(trustProfileId: string): Promise<void>;
  findById(trustProfileId: string): Promise<TrustProfile | null>;
  findByName(name: string): Promise<TrustProfile | null>;
  findByCategory(category: string): Promise<readonly TrustProfile[]>;
  listAll(): Promise<readonly TrustProfile[]>;
}
