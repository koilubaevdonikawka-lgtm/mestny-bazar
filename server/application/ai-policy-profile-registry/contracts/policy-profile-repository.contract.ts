import type { PolicyProfile } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

export interface IPolicyProfileRepository {
  save(policyProfile: PolicyProfile): Promise<void>;
  findById(policyProfileId: string): Promise<PolicyProfile | null>;
  findByName(name: string): Promise<PolicyProfile | null>;
  findByCategory(category: string): Promise<readonly PolicyProfile[]>;
  findAll(): Promise<readonly PolicyProfile[]>;
  delete(policyProfileId: string): Promise<boolean>;
}
