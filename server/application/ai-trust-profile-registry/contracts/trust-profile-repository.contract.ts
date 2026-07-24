import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

export interface ITrustProfileRepository {
  save(trustProfile: TrustProfile): Promise<void>;
  findById(trustProfileId: string): Promise<TrustProfile | null>;
  findByName(name: string): Promise<TrustProfile | null>;
  findByCategory(category: string): Promise<readonly TrustProfile[]>;
  findAll(): Promise<readonly TrustProfile[]>;
  delete(trustProfileId: string): Promise<boolean>;
}
